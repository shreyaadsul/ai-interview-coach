import re

# Expected skills mapped by normalized target roles
ROLE_EXPECTED_SKILLS = {
    "software engineer": [
        "python", "java", "c++", "javascript", "sql", "git", "docker", 
        "aws", "kubernetes", "rest api", "system design", "data structures", "algorithms"
    ],
    "backend developer": [
        "python", "java", "c++", "javascript", "sql", "git", "docker", 
        "aws", "kubernetes", "rest api", "system design", "data structures", "algorithms"
    ],
    "frontend developer": [
        "javascript", "typescript", "react", "html", "css", "vue", 
        "angular", "tailwind", "git", "webpack", "npm", "sass"
    ],
    "machine learning engineer": [
        "python", "machine learning", "deep learning", "sql", "pandas", "numpy", 
        "scikit-learn", "tensorflow", "pytorch", "git", "nlp", "computer vision"
    ],
    "ml engineer": [
        "python", "machine learning", "deep learning", "sql", "pandas", "numpy", 
        "scikit-learn", "tensorflow", "pytorch", "git", "nlp", "computer vision"
    ],
    "ai engineer": [
        "python", "machine learning", "deep learning", "sql", "pandas", "numpy", 
        "scikit-learn", "tensorflow", "pytorch", "git", "nlp", "computer vision"
    ],
    "data scientist": [
        "python", "machine learning", "deep learning", "sql", "pandas", "numpy", 
        "scikit-learn", "tensorflow", "pytorch", "git", "nlp", "computer vision"
    ],
    "data analyst": [
        "sql", "excel", "python", "r", "tableau", "power bi", "pandas", "statistics", "data visualization"
    ],
    "hr executive": [
        "recruiting", "sourcing", "onboarding", "hris", "communication", 
        "employee relations", "talent acquisition", "performance management"
    ],
    "general": [
        "python", "sql", "git", "aws", "docker", "javascript", "html", "css", 
        "react", "communication", "project management", "agile", "scrum"
    ]
}

def get_expected_skills(target_role):
    normalized = target_role.strip().lower()
    for role_key, skills in ROLE_EXPECTED_SKILLS.items():
        if role_key in normalized:
            return skills
    return ROLE_EXPECTED_SKILLS["general"]

def calculate_ats_score(resume_text, target_role):
    """
    Calculate ATS compatibility score deterministically.
    """
    text_lower = resume_text.lower()
    expected_skills = get_expected_skills(target_role)
    
    # 1. Keyword Match (30%)
    found_skills = [skill for skill in expected_skills if skill in text_lower]
    keyword_match = (len(found_skills) / len(expected_skills)) * 100 if expected_skills else 0
    
    # 2. Resume Structure (15%)
    sections = ["experience", "education", "projects", "skills", "contact", "summary", "languages", "certifications"]
    found_sections = [sec for sec in sections if sec in text_lower]
    # Finding 6+ sections gets full 100%
    resume_structure = min(100, (len(found_sections) / 6.0) * 100)
    
    # 3. Action Verbs (10%)
    verbs = ["built", "created", "developed", "implemented", "optimized", "designed", "led", "managed", "analyzed", "engineered"]
    found_verbs = [v for v in verbs if v in text_lower]
    # Finding 5+ verbs gets full 100%
    action_verbs = min(100, (len(found_verbs) / 5.0) * 100)
    
    # 4. Quantified Impact (15%)
    # Count occurrences of % symbols, $ or USD, and standalone digits
    percent_count = len(re.findall(r'%', resume_text))
    dollar_count = len(re.findall(r'\$|usd', text_lower))
    numbers_count = len(re.findall(r'\b\d+\b', resume_text))
    # Heuristics: N percentage/currency counts or digits
    impact_score = min(100, (percent_count + dollar_count) * 20 + numbers_count * 5)
    
    # 5. Skill Relevance (20%)
    # Ratio of detected expected skills relative to a healthy baseline of 7 skills
    skill_relevance = min(100, len(found_skills) * 15.0)
    
    # 6. Formatting Quality (10%)
    has_email = 1 if re.search(r'[\w\.-]+@[\w\.-]+\.\w+', resume_text) else 0
    has_phone = 1 if re.search(r'\b\d{10}\b|\+\d{1,3}[\s-]?\d{10}\b', resume_text) else 0
    has_links = 1 if ("github.com" in text_lower or "linkedin.com" in text_lower) else 0
    length_ok = 1 if (1000 <= len(resume_text) <= 8000) else 0
    
    formatting_quality = (has_email * 30 + has_phone * 30 + has_links * 20 + length_ok * 20)
    
    overall_ats = (
        keyword_match * 0.30 +
        resume_structure * 0.15 +
        action_verbs * 0.10 +
        impact_score * 0.15 +
        skill_relevance * 0.20 +
        formatting_quality * 0.10
    )
    
    # Strictly return bounded integer
    return int(round(max(10, min(100, overall_ats))))

def calculate_resume_score(parsed_result, ats_score, resume_text=""):
    """
    Calculate Resume Score separately using deterministic rules.
    """
    # 1. Technical Skills (25%)
    skills = parsed_result.get("skills", [])
    tech_skills_score = min(100, len(skills) * 10.0) # 10+ skills = 100%
    
    # 2. Projects (25%)
    projects_count = parsed_result.get("projects_count", 0)
    projects_score = min(100, projects_count * 33.3) # 3+ projects = 100%
    
    # 3. Experience (15%)
    exp_level = str(parsed_result.get("experience_level", "")).lower()
    if "senior" in exp_level or "lead" in exp_level:
        exp_score = 100
    elif "mid" in exp_level or "intermediate" in exp_level or "associate" in exp_level:
        exp_score = 85
    elif "junior" in exp_level:
        exp_score = 70
    elif "fresh" in exp_level or "student" in exp_level or "intern" in exp_level:
        exp_score = 50
    else:
        exp_score = 65
        
    # 4. Education (10%)
    edu_text = str(parsed_result.get("education", "")).lower()
    if "phd" in edu_text or "doctor" in edu_text:
        edu_score = 100
    elif "master" in edu_text or "mtech" in edu_text or "mba" in edu_text or "ms" in edu_text:
        edu_score = 90
    elif "bachelor" in edu_text or "btech" in edu_text or "be" in edu_text or "bs" in edu_text or "graduate" in edu_text:
        edu_score = 80
    elif "school" in edu_text or "diploma" in edu_text:
        edu_score = 60
    else:
        edu_score = 70
        
    # 5. Certifications (10%)
    text_to_check = (resume_text + " " + str(parsed_result)).lower()
    cert_terms = ["certified", "certification", "certificate", "credential", "license"]
    has_cert = any(term in text_to_check for term in cert_terms)
    cert_score = 100 if has_cert else 50
    
    # 6. ATS Compatibility (15%)
    ats_compat = float(ats_score)
    
    overall_resume = (
        tech_skills_score * 0.25 +
        projects_score * 0.25 +
        exp_score * 0.15 +
        edu_score * 0.10 +
        cert_score * 0.10 +
        ats_compat * 0.15
    )
    
    return int(round(max(10, min(100, overall_resume))))

def calculate_interview_scores(questions, answers, user_skills):
    """
    Calculate 5 interview component scores and overall score deterministically.
    """
    tech_accuracy_scores = []
    communication_scores = []
    completeness_scores = []
    confidence_scores = []
    problem_solving_scores = []
    
    for q, a in zip(questions, answers):
        a_strip = a.strip().lower()
        if not a_strip or a_strip == "skipped":
            tech_accuracy_scores.append(0)
            communication_scores.append(0)
            completeness_scores.append(0)
            confidence_scores.append(0)
            problem_solving_scores.append(0)
            continue
            
        # 1. Completeness
        word_count = len(a.split())
        comp_val = min(100, word_count * 2.5) # 40 words gets 100%
        completeness_scores.append(comp_val)
        
        # 2. Confidence
        conf_val = 100
        fillers = ["um", "uh", "like", "maybe", "probably", "i think", "sort of", "dont know", "don't know", "not sure"]
        for filler in fillers:
            count = a_strip.count(filler)
            conf_val -= count * 8
        conf_val = max(20, conf_val)
        confidence_scores.append(conf_val)
        
        # 3. Communication
        words = a_strip.split()
        unique_words = len(set(words))
        ratio = unique_words / len(words) if len(words) > 0 else 0
        comm_val = min(100, max(30, int(ratio * 100)))
        communication_scores.append(comm_val)
        
        # 4. Problem Solving
        transition_words = ["first", "second", "then", "finally", "however", "therefore", "because", "so", "solve", "approach", "structure", "result"]
        matches = sum(1 for word in transition_words if word in a_strip)
        ps_val = min(100, 30 + matches * 20) # 4 transitions = 100%
        problem_solving_scores.append(ps_val)
        
        # 5. Technical Accuracy
        q_words = set(w.strip("?,.:;!") for w in q.lower().split())
        stop_words = {"what", "how", "why", "explain", "describe", "tell", "me", "about", "your", "you", "a", "an", "the", "in", "on", "at", "to", "for", "with", "is", "are", "was", "were", "do", "does", "did", "have", "has", "had", "can", "could", "should", "would"}
        q_keywords = q_words - stop_words
        
        matches = sum(1 for kw in q_keywords if len(kw) > 2 and kw in a_strip)
        skills_matches = sum(1 for skill in user_skills if skill.lower() in a_strip)
        
        tech_val = min(100, 40 + matches * 15 + skills_matches * 15)
        tech_accuracy_scores.append(tech_val)
        
    # Aggregate (mean) across all questions
    n = len(questions)
    if n == 0:
        return {
            "technical_accuracy": 0,
            "communication": 0,
            "completeness": 0,
            "confidence": 0,
            "problem_solving": 0,
            "overall_score": 0
        }
        
    tech = sum(tech_accuracy_scores) / n
    comm = sum(communication_scores) / n
    comp = sum(completeness_scores) / n
    conf = sum(confidence_scores) / n
    ps = sum(problem_solving_scores) / n
    
    overall = tech * 0.30 + comm * 0.20 + comp * 0.20 + conf * 0.15 + ps * 0.15
    
    return {
        "technical_accuracy": int(round(tech)),
        "communication": int(round(comm)),
        "completeness": int(round(comp)),
        "confidence": int(round(conf)),
        "problem_solving": int(round(ps)),
        "overall_score": int(round(overall))
    }
