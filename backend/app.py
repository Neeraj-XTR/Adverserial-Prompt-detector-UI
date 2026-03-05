from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import defaultdict
import re
import base64

app = Flask(__name__)
CORS(app)

# ===== PATTERNS =====
JAILBREAK_PATTERNS = [
    r"ignore (all|previous|above) instructions",
    r"you are now (dan|do anything now)",
    r"no restrictions",
    r"bypass (policy|rules|safeguards)",
    r"act as an? (evil|uncensored|rogue)",
    r"hypothetically|for educational purposes only",
    r"this is fictional",
]

INJECTION_PATTERNS = [
    r"<<system>>",
    r"<<assistant>>",
    r"<<user>>",
    r"system prompt",
    r"developer message",
    r"rewrite your instructions",
    r"print the hidden prompt",
    r"reveal your chain of thought",
]

ROLE_CONFUSION = [
    r"you are the system",
    r"override system",
    r"forget your role",
]

ENCODING_PATTERNS = [
    r"base64",
    r"rot13",
    r"hex encoded",
]

CRITICAL_JAILBREAK_PATTERNS = [
    r"ignore (all|previous|above) instructions",
    r"you are now (dan|do anything now)",
    r"bypass (policy|rules|safeguards)",
    r"no restrictions",
    r"act as an? (unfiltered|uncensored|rogue)"
]

ALL_PATTERNS = {
    "jailbreak": JAILBREAK_PATTERNS,
    "injection": INJECTION_PATTERNS + ROLE_CONFUSION,
    "encoding": ENCODING_PATTERNS,
    "criticality": CRITICAL_JAILBREAK_PATTERNS,
}

# ===== OBFUSCATION DETECTION =====
def detect_base64(prompt: str):
    try:
        decoded = base64.b64decode(prompt).decode("utf-8")
        return True, decoded
    except Exception:
        return False, None

def detect_unicode_obfuscation(prompt: str):
    return any(ord(c) > 127 for c in prompt)

def detect_spacing_attack(prompt: str):
    return bool(re.search(r"(i\s+g\s+n\s+o\s+r\s+e)", prompt.lower()))

# ===== HEURISTIC SCAN =====
def heuristic_scan(prompt: str):
    findings = defaultdict(list)
    score = {"jailbreak": 0, "injection": 0}

    text = prompt.lower()

    for category, patterns in ALL_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text):
                findings[category].append(pattern)
                if category == "jailbreak":
                    score["jailbreak"] += 1
                elif category == "injection":
                    score["injection"] += 1

    for pattern in CRITICAL_JAILBREAK_PATTERNS:
        if re.search(pattern, text):
            findings["critical_jailbreak"].append(pattern)
            score["jailbreak"] += 3

    manipulation_terms = [
        "ignore", "bypass", "override", "forget", "disable",
        "no longer", "without restrictions"
    ]
    manipulation_hits = sum(text.count(w) for w in manipulation_terms)

    if manipulation_hits >= 0:
        score["jailbreak"] += 1
        findings["heuristic"].append("instruction_manipulation")

    return score, dict(findings)

# ===== CLASSIFIER =====
def classify_prompt(prompt: str):
    score, findings = heuristic_scan(prompt)

    obfuscation = []

    is_b64, decoded = detect_base64(prompt)
    if is_b64:
        obfuscation.append("base64_encoded")
        findings["decoded_payload"] = decoded

    if detect_unicode_obfuscation(prompt):
        obfuscation.append("unicode_obfuscation")

    if detect_spacing_attack(prompt):
        obfuscation.append("spacing_attack")

    if obfuscation:
        findings["obfuscation"] = obfuscation
        score["jailbreak"] += 1

    # Final decision
    if score["jailbreak"] >= 1:
        label = "jailbreak"
    elif score["injection"] >= 1:
        label = "injection"
    else:
        label = "benign"

    confidence = min(0.99, 0.4 + 0.15 * max(score.values()))

    return {
        "label": label,
        "confidence": round(confidence, 2),
        "scores": score,
        "findings": findings,
    }

# ===== API ROUTES =====
@app.route('/api/detect', methods=['POST'])
def detect():
    data = request.get_json()
    prompt = data.get('prompt', '')

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    result = classify_prompt(prompt)
    return jsonify(result)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
