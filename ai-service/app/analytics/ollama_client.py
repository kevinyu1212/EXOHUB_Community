import os
import httpx


def generate_ollama_reply(
    system_prompt: str,
    user_prompt: str,
    timeout_sec: float = 8.0,
) -> tuple[str | None, str]:
  base_url = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").strip().rstrip("/")
  model = os.getenv("OLLAMA_MODEL", "qwen2.5:7b").strip()
  if not base_url or not model:
    return None, model

  payload = {
      "model": model,
      "stream": False,
      "messages": [
          {"role": "system", "content": system_prompt},
          {"role": "user", "content": user_prompt},
      ],
      "options": {
          "temperature": 0.35,
      },
  }

  try:
    with httpx.Client(timeout=timeout_sec) as client:
      resp = client.post(f"{base_url}/api/chat", json=payload)
      resp.raise_for_status()
      data = resp.json()
      msg = data.get("message") or {}
      content = str(msg.get("content", "")).strip()
      if content:
        return content, model
      return None, model
  except Exception:
    return None, model