from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import joblib

from scipy.sparse import hstack
from tensorflow.keras.models import load_model

app = Flask(__name__)

# Load model and preprocessors
model = load_model("fraudulent_job_model.keras")
tfidf = joblib.load("tfidf_vectorizer.pkl")
preprocessor = joblib.load("categorical_preprocessor.pkl")


@app.route("/")
def home():
    return {"message": "JobShieldAI API Running"}


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    text = " ".join([
        data.get("title", ""),
        data.get("company_profile", ""),
        data.get("description", ""),
        data.get("requirements", ""),
        data.get("benefits", "")
    ])

    text_features = tfidf.transform([text])

    cat_df = pd.DataFrame([{
        "location": data.get("location", "missing"),
        "department": data.get("department", "missing"),
        "salary_range": data.get("salary_range", "missing"),
        "employment_type": data.get("employment_type", "missing"),
        "required_experience": data.get("required_experience", "missing"),
        "required_education": data.get("required_education", "missing"),
        "industry": data.get("industry", "missing"),
        "function": data.get("function", "missing"),
        "telecommuting": data.get("telecommuting", 0),
        "has_company_logo": data.get("has_company_logo", 0),
        "has_questions": data.get("has_questions", 0)
    }])

    cat_features = preprocessor.transform(cat_df)

    final_features = hstack([text_features, cat_features])

    prediction = model.predict(final_features.toarray())

    probability = float(prediction[0][0])

    result = "Fraudulent" if probability > 0.5 else "Legitimate"

    return jsonify({
        "prediction": result,
        "fraud_probability": round(probability * 100, 2)
    })


if __name__ == "__main__":
    app.run(debug=True)