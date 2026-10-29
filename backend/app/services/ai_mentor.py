import os

def get_ai_hint(problem: str, code: str, error: str):
    api_key = os.getenv("OPENAI_API_KEY")
    
    # API Key இருந்தால் OpenAI-ஐ அழைக்கும்
    if api_key:
        from langchain_openai import ChatOpenAI
        from langchain_core.prompts import PromptTemplate
        
        llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.3)
        hint_template = """
        You are a LeetCode AI Mentor. 
        Problem: {problem}
        User Code: {code}
        Error Output: {error}

        Provide a small, progressive hint using Socratic questioning.
        """
        prompt = PromptTemplate(input_variables=["problem", "code", "error"], template=hint_template)
        formatted_prompt = prompt.format(problem=problem, code=code, error=error)
        response = llm.invoke(formatted_prompt)
        return response.content
    
    # API Key இல்லாத போது Mock Hint தரும்
    return f"💡 [AI Hint Mock]: Your code failed with error: '{error}'. Check edge cases or loop boundaries!"