# **App Name**: TriageSenseAI

## Core Features:

- Risk Classification: Utilize ML models (XGBoost/LightGBM) to classify patient risk based on input data.
- Urgency Index Computation: Compute a dynamic urgency index based on risk probability, vital instability score, and symptom severity.
- Optimal Department Recommendation: Recommend the most suitable department based on patient condition and hospital resource availability using fit scoring.
- Resource Availability Consideration: Take into account real-time hospital resource availability (beds, staff) when recommending departments.
- Explainable AI Insights: Provide insights into the AI's decision-making process using SHAP values to help doctors understand the tool.
- Real-time Command Center Dashboard: Display a real-time dashboard with a live triage queue, patient details, and AI insights.
- Emergency Mode Access: Allow emergency access to the system with optional authentication for high-urgency cases via Firebase Anonymous Authentication.
- Role-Based Dashboards: Route users to role-based dashboards (Admin, Doctor, Triage Staff, Patient) based on Firebase Custom Claims.
- Fairness and Bias Monitoring: Track prediction distributions to identify potential biases, triggering alerts when deviations exceed acceptable limits.
- Synthetic Data Generation: Generate synthetic data using SDV to simulate patient metadata and train the ML models.

## Style Guidelines:

- Primary color: Deep Blue (#2962FF) for a professional and trustworthy feel, reflecting stability and intelligence.
- Background color: Light gray (#F0F4F8) for a clean, modern look, providing visual comfort and reducing eye strain.
- Accent color: Electric Blue (#7DF9FF) for highlighting important elements, creating a sense of urgency and drawing attention.
- Body text font: 'PT Sans' (sans-serif) for a modern, clear, and readable appearance in body text.
- Headline font: 'Space Grotesk' (sans-serif) for headlines and titles, providing a techy and modern feel.
- Code font: 'Source Code Pro' for displaying any code snippets within the app.
- Use clean and professional icons, ensuring they are easily recognizable and intuitive.
- Implement a responsive, modular layout that adapts to different screen sizes and devices.
- Incorporate subtle animations and transitions for a smooth and engaging user experience, utilizing Framer Motion.