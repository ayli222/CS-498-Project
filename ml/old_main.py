#%%
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report


# Load and preprocess
data = pd.read_csv("heart_disease.csv")
if "id" in data.columns:
    data = data.drop(columns=["id"])

data = data.fillna(data.median(numeric_only=True))

X = data.drop(columns=["thal", "cp"])
y = data["thal"]

# Train model
model = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", LogisticRegression(
        penalty="elasticnet",
        solver="saga",
        l1_ratio=0.5,
        class_weight="balanced",
        C=0.1,
        max_iter=5000,
        random_state=42
    ))
])
model.fit(X, y)

y_pred = model.predict(X)
print(classification_report(y, y_pred))



#%%
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd

# ---- Feature attribution as a waterfall relative to the mean ----

# 1) Pick a single example
i = 4  # index of datapoint
x_instance = X.iloc[[i]]

# 2) Extract trained pieces
scaler = model.named_steps["scaler"]
clf = model.named_steps["clf"]

# 3) Get scaled instance and mean
x_scaled = scaler.transform(x_instance)                  # (1, n_features)
x_mean = pd.DataFrame([X.mean()])                        # mean in original space
x_mean_scaled = scaler.transform(x_mean)                 # (1, n_features)

n_classes = clf.coef_.shape[0]

if n_classes == 1:
    # Binary logistic regression: coef_ is for classes_[1] vs classes_[0]
    class_idx = 0
    class_label = clf.classes_[1]  # "positive" class
else:
    # Multiclass: use the predicted class
    pred_class = clf.predict(x_scaled)[0]
    class_idx = np.where(clf.classes_ == pred_class)[0][0]
    class_label = pred_class

coefs = clf.coef_[class_idx]          # (n_features,)
intercept = clf.intercept_[class_idx]

# 4) Compute log-odds (decision function) for mean and instance
logit_mean = float(x_mean_scaled @ coefs.reshape(-1, 1) + intercept)
logit_instance = float(x_scaled @ coefs.reshape(-1, 1) + intercept)

# 5) Contributions: how each feature moves us away from the mean
delta_x = x_scaled - x_mean_scaled            # (1, n_features)
contrib = (delta_x * coefs).flatten()         # sum(contrib) ≈ logit_instance - logit_mean

# Sort features by absolute contribution
order = np.argsort(np.abs(contrib))[::-1]
features_sorted = np.array(X.columns)[order]
contrib_sorted = contrib[order]

# 6) Build waterfall data (cumulative logit)
steps = [logit_mean]
for c in contrib_sorted:
    steps.append(steps[-1] + c)
steps = np.array(steps)

# 7) Plot waterfall
labels = ["Baseline\n(mean)"] + list(features_sorted)

plt.figure(figsize=(10, 5))
current_vals = logit_mean
for idx, (feat, c, start, end) in enumerate(zip(features_sorted, contrib_sorted, steps[:-1], steps[1:])):
    color = "tab:green" if c > 0 else "tab:red"
    plt.bar(idx + 1, end - start, bottom=min(start, end), color=color)

# Baseline and final as points/lines
plt.axhline(logit_mean, linestyle="--", linewidth=1, label="Baseline log-odds")
plt.scatter(len(labels), logit_instance, marker="o", label="Final log-odds")

plt.xticks(range(len(labels) + 1), labels + ["Final"], rotation=45, ha="right")
plt.ylabel(f"Log-odds for class {class_label}")
plt.title(f"Waterfall Feature Attribution for Sample #{i}\n(relative to mean patient)")
plt.legend()
plt.tight_layout()
plt.show()

# Optional: show baseline vs instance probabilities for that class
from scipy.special import expit

p_mean = expit(logit_mean)
p_instance = expit(logit_instance)
print(f"Baseline prob (mean patient) for class {class_label}: {p_mean:.3f}")
print(f"Instance prob for class {class_label}: {p_instance:.3f}")


# %%
