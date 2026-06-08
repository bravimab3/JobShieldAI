document
.getElementById("analyzeBtn")
.addEventListener("click", async () => {

    const resultBox = document.getElementById("result");
    const alertBox = document.getElementById("alert-box");

    // Loading state
    resultBox.innerHTML = `
        <h2>Scanning...</h2>
        <p>Analyzing job posting...</p>
    `;

    const data = {

        title:
        document.getElementById("title").value,

        location:
        document.getElementById("location").value,

        company_profile:
        document.getElementById("company_profile").value,

        description:
        document.getElementById("description").value,

        requirements:
        document.getElementById("requirements").value,

        industry:
        document.getElementById("industry").value,

        employment_type:
        document.getElementById("employment_type").value,

        telecommuting:
        document.getElementById("telecommuting").checked ? 1 : 0,

        has_company_logo:
        document.getElementById("logo").checked ? 1 : 0,

        has_questions:
        document.getElementById("questions").checked ? 1 : 0
    };

    try {

        const response = await fetch("/predict", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        });

        const result = await response.json();

        console.log(result);

        document.getElementById("risk-score").innerHTML =
        `Probability score calculated: ${result.fraud_probability}%`;

        // Alert box
        if (result.prediction === "Fraudulent") {

            alertBox.innerHTML =
            "⚠ HIGH RISK OF PHISHING DETECTED";

            alertBox.style.background = "#4b1f1f";

        } else {

            alertBox.innerHTML =
            "✓ LEGITIMATE JOB POSTING";

            alertBox.style.background = "#173524";
        }

        // Result card
        resultBox.innerHTML = `

            <h1 style="
                color:${result.prediction === 'Fraudulent'
                ? '#ff6666'
                : '#57ff98'};
                font-size:60px;
                margin-bottom:20px;
            ">
                ${result.prediction}
            </h1>

            <p style="font-size:22px;">
                <strong>Risk Level:</strong>
                ${result.risk_level}
            </p>

            <p style="font-size:22px; margin-top:10px;">
                <strong>Fraud Probability:</strong>
                ${result.fraud_probability}%
            </p>

            <h3 style="margin-top:25px;">
                Potential Risk Factors
            </h3>

            <ul style="
                margin-top:15px;
                padding-left:20px;
                line-height:1.8;
            ">
                ${(result.reasons || [])
                    .map(reason => `<li>${reason}</li>`)
                    .join("")}
            </ul>
        `;

    } catch (error) {

        console.error(error);

        resultBox.innerHTML = `
            <h2 style="color:red;">
                Error
            </h2>

            <p>
                Unable to connect to backend.
            </p>
        `;
    }

});