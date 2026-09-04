"""
LLM (Language Model) Handler using Hugging Face Transformers
Supports local inference without external API keys
"""

import torch
import logging
from typing import Optional, Tuple
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
from config import settings
import time

logger = logging.getLogger(__name__)


class LLMManager:
    """Manages LLM loading and inference"""
    
    def __init__(self):
        """Initialize LLM Manager"""
        self.model = None
        self.tokenizer = None
        self.pipeline_instance = None
        self.device = self._get_device()
        self._loaded = False
    
    def _get_device(self) -> str:
        """Get the appropriate device for inference"""
        if settings.LLM_DEVICE == "cuda":
            if torch.cuda.is_available():
                logger.info(f"Using CUDA device: {torch.cuda.get_device_name(0)}")
                return "cuda"
            else:
                logger.warning("CUDA device requested but not available. Falling back to CPU")
                return "cpu"
        elif settings.LLM_DEVICE == "mps":
            if hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
                logger.info("Using Metal Performance Shaders (MPS) on Apple Silicon")
                return "mps"
            else:
                logger.warning("MPS device requested but not available. Falling back to CPU")
                return "cpu"
        else:
            logger.info("Using CPU for inference")
            return "cpu"
    
    def load_model(self) -> bool:
        """
        Load the LLM model from Hugging Face
        
        Returns:
            True if model loaded successfully, False otherwise
        """
        if self._loaded:
            logger.info("Model already loaded")
            return True
        
        try:
            logger.info(f"Loading model: {settings.LLM_MODEL_NAME}")
            logger.info(f"Cache directory: {settings.LLM_CACHE_DIR}")
            logger.info(f"Device: {self.device}")
            
            start_time = time.time()
            
            # Load tokenizer
            logger.info("Loading tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained(
                settings.LLM_MODEL_NAME,
                cache_dir=settings.LLM_CACHE_DIR,
                trust_remote_code=True
            )
            
            # Create text generation pipeline
            logger.info("Loading model and creating pipeline...")
            self.pipeline_instance = pipeline(
                "text-generation",
                model=settings.LLM_MODEL_NAME,
                tokenizer=self.tokenizer,
                device=self.device if self.device != "cpu" else -1,
                model_kwargs={
                    "cache_dir": settings.LLM_CACHE_DIR,
                    "torch_dtype": torch.float16 if self.device in ["cuda", "mps"] else torch.float32,
                    "trust_remote_code": True
                },
                batch_size=1
            )
            
            self._loaded = True
            elapsed = time.time() - start_time
            logger.info(f"Model loaded successfully in {elapsed:.2f} seconds")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            self._loaded = False
            return False
    
    def is_loaded(self) -> bool:
        """Check if model is loaded"""
        return self._loaded
    
    def generate_text(
        self,
        prompt: str,
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        top_p: float = 0.9
    ) -> Tuple[str, int]:
        """
        Generate text using the LLM
        
        Args:
            prompt: Input prompt
            max_tokens: Maximum tokens to generate (uses setting if not provided)
            temperature: Sampling temperature (0.0-1.0)
            top_p: Top-p (nucleus) sampling parameter
            
        Returns:
            Tuple of (generated_text, token_count)
            
        Raises:
            RuntimeError: If model is not loaded
            ValueError: If parameters are invalid
        """
        if not self._loaded:
            raise RuntimeError("Model is not loaded. Call load_model() first.")
        
        if not prompt or not isinstance(prompt, str):
            raise ValueError("Prompt must be a non-empty string")
        
        if not 0.0 <= temperature <= 2.0:
            raise ValueError("Temperature must be between 0.0 and 2.0")
        
        if not 0.0 <= top_p <= 1.0:
            raise ValueError("top_p must be between 0.0 and 1.0")
        
        max_tokens = max_tokens or settings.MAX_TOKENS
        
        try:
            logger.debug(f"Generating text with prompt length: {len(prompt)}")
            
            # Generate
            outputs = self.pipeline_instance(
                prompt,
                max_new_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                do_sample=True,
                num_return_sequences=1,
                eos_token_id=self.tokenizer.eos_token_id,
                pad_token_id=self.tokenizer.eos_token_id,
            )
            
            # Extract generated text (remove the prompt from output)
            generated = outputs[0]["generated_text"]
            result_text = generated[len(prompt):].strip()
            
            # Estimate token count
            tokens = self.tokenizer.encode(result_text)
            token_count = len(tokens)
            
            logger.debug(f"Generated {token_count} tokens")
            
            return result_text, token_count
            
        except Exception as e:
            logger.error(f"Error generating text: {str(e)}")
            raise
    
    def count_tokens(self, text: str) -> int:
        """
        Count tokens in text
        
        Args:
            text: Text to tokenize
            
        Returns:
            Number of tokens
        """
        if not self.tokenizer:
            raise RuntimeError("Tokenizer is not loaded")
        
        try:
            tokens = self.tokenizer.encode(text)
            return len(tokens)
        except Exception as e:
            logger.error(f"Error counting tokens: {str(e)}")
            raise
    
    def truncate_text(self, text: str, max_tokens: int) -> str:
        """
        Truncate text to fit within token limit
        
        Args:
            text: Text to truncate
            max_tokens: Maximum number of tokens
            
        Returns:
            Truncated text
        """
        if not self.tokenizer:
            raise RuntimeError("Tokenizer is not loaded")
        
        try:
            tokens = self.tokenizer.encode(text)
            if len(tokens) <= max_tokens:
                return text
            
            # Decode truncated tokens
            truncated_tokens = tokens[:max_tokens]
            truncated_text = self.tokenizer.decode(truncated_tokens, skip_special_tokens=True)
            
            logger.debug(f"Truncated text from {len(tokens)} to {max_tokens} tokens")
            return truncated_text
            
        except Exception as e:
            logger.error(f"Error truncating text: {str(e)}")
            raise


# Global LLM manager instance
llm_manager = LLMManager()


async def ensure_llm_loaded():
    """Ensure LLM is loaded (can be called on startup)"""
    if not llm_manager.is_loaded():
        logger.info("LLM not loaded, attempting to load...")
        success = llm_manager.load_model()
        if success:
            logger.info("LLM loaded successfully")
        else:
            logger.warning("Failed to load LLM automatically")
    return llm_manager.is_loaded()
