import os
from dotenv import load_dotenv
import streamlit as st
from langchain_groq import ChatGroq
from langchain.agents import create_agent
from langchain_core.messages import AIMessage, HumanMessage

# 🌐 Load .env file and API key
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)
api_key = os.getenv("GROQ_API_KEY", "")
os.environ["GROQ_API_KEY"] = api_key

if not api_key:
    st.warning("⚠️ API Key not found! Please check your .env file and ensure GROQ_API_KEY is set. Operating in Demo/Simulated mode.")

# ✅ Set up LangChain LLM using Groq
if api_key:
    llm = ChatGroq(
        temperature=0.7,
        api_key=api_key,
        model="llama-3.1-8b-instant"  # Currently supported Groq model
    )
else:
    llm = None

# 🎨 Set up Streamlit UI
st.set_page_config(page_title="AI Interview Coach", page_icon="🧑‍💼")
st.title("🧑‍💼 AI Interview Coach")
st.write("Practice your answers and get real-time AI feedback!")

# 👩‍💼 Select job role
job_role = st.selectbox("Choose Job Role", ["Machine Learning Engineer", "Frontend Developer", "Data Analyst", "HR Executive"])

# 🧠 Setup memory & agent
if "messages" not in st.session_state:
    st.session_state.messages = []
if "agent" not in st.session_state:
    if llm:
        st.session_state.agent = create_agent(
            model=llm,
            tools=[]
        )
    else:
        st.session_state.agent = None

# ❓ Define interview questions
questions = {
    "Machine Learning Engineer": [
        "Explain overfitting and how to prevent it.",
        "How would you improve a model with low recall?"
    ],
    "Frontend Developer": [
        "What’s the difference between React and Angular?",
        "How do you optimize frontend performance?"
    ],
    "Data Analyst": [
        "How do you handle missing data?",
        "Explain the difference between inner and outer joins."
    ],
    "HR Executive": [
        "How would you resolve a conflict between two employees?",
        "What’s your strategy for employee engagement?"
    ]
}

# 📍 Set question index
if "q_index" not in st.session_state:
    st.session_state.q_index = 0

curr_question_list = questions[job_role]

# 🧾 Ask questions and receive feedback
if st.session_state.q_index < len(curr_question_list):
    st.subheader(f"🗨️ Question: {curr_question_list[st.session_state.q_index]}")
    user_input = st.text_area("Your Answer:", key="user_answer")

    if st.button("Submit Answer"):
        if not api_key:
            simulated_response = (
                f"Evaluation for **{job_role}**:\n\n"
                f"**Confidence & Clarity**: Great attempt! Your answer covers core concepts but can be enhanced.\n"
                f"**Suggested Improvement**: For the question *'{curr_question_list[st.session_state.q_index]}'*, try to structure your answer using the STAR method (Situation, Task, Action, Result) to make it more impactful.\n\n"
                f"*To enable real-time AI evaluation using Llama 3 on Groq, please supply your `GROQ_API_KEY` in the `.env` file.*"
            )
            st.session_state.messages.append(HumanMessage(content=user_input))
            st.session_state.messages.append(AIMessage(content=simulated_response))
            st.write("🤖 Feedback (Simulated):", simulated_response)
            st.session_state.q_index += 1
        else:
            prompt = f"""
            You are an AI interview coach. Give feedback on this answer for the role of {job_role}.
            Be clear, constructive, and evaluate confidence, clarity, and relevance.
            Candidate's answer: {user_input}
            """
            result = st.session_state.agent.invoke({
                "messages": st.session_state.messages + [{"role": "user", "content": prompt}]
            })
            st.session_state.messages = result["messages"]
            response = st.session_state.messages[-1].content
            st.write("🤖 Feedback:", response)
            st.session_state.q_index += 1
else:
    st.success("🎉 Interview session complete!")
    st.button("Restart", on_click=lambda: st.session_state.update(q_index=0, messages=[]))

# 🧠 Show memory log
with st.expander("🧾 Interview Log"):
    log_text = ""
    if "messages" in st.session_state:
        for m in st.session_state.messages:
            role = getattr(m, "type", "unknown").capitalize()
            log_text += f"{role}: {m.content}\n"
    st.markdown(f"```\n{log_text}\n```")
