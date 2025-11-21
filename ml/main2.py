#%%
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd

from xgboost import XGBClassifier
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score
)

import shap
from scipy.special import expit  # sigmoid

# --------------------------
# 1. Load and preprocess data
# --------------------------
data = pd.read_csv("heart_disease.csv")

if "id" in data.columns:
    data = data.drop(columns=["id"])

# Fill missing numeric values
data = data.fillna(data.median(numeric_only=True))

# Target: thal; Drop cp (domain-based choice)
X = data.drop(columns=["thal", "cp"])
y = data["thal"]

# --------------------------
# 2. 10-fold cross-validation metrics
# --------------------------
X_np = X.values
y_np = y.values

kf = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)

accs, precs, recs, f1s, aucs = [], [], [], [], []

for train_idx, test_idx in kf.split(X_np, y_np):
    X_train, X_test = X_np[train_idx], X_np[test_idx]
    y_train, y_test = y_np[train_idx], y_np[test_idx]

    clf_cv = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="binary:logistic",
        eval_metric="logloss",
        random_state=42
    )

    clf_cv.fit(X_train, y_train)

    y_pred = clf_cv.predict(X_test)
    y_proba = clf_cv.predict_proba(X_test)[:, 1]

    accs.append(accuracy_score(y_test, y_pred))
    precs.append(precision_score(y_test, y_pred))
    recs.append(recall_score(y_test, y_pred))
    f1s.append(f1_score(y_test, y_pred))
    aucs.append(roc_auc_score(y_test, y_proba))

print("\n===== 10-Fold Cross-Validation Metrics =====")
print(f"Accuracy:  {np.mean(accs):.3f} ± {np.std(accs):.3f}")
print(f"Precision: {np.mean(precs):.3f} ± {np.std(precs):.3f}")
print(f"Recall:    {np.mean(recs):.3f} ± {np.std(recs):.3f}")
print(f"F1 Score:  {np.mean(f1s):.3f} ± {np.std(f1s):.3f}")
print(f"ROC AUC:   {np.mean(aucs):.3f} ± {np.std(aucs):.3f}")

#%%
# --------------------------
# 3. Fit final model on all data (for SHAP)
# --------------------------
clf = XGBClassifier(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="binary:logistic",
    eval_metric="logloss",
    random_state=42
)
clf.fit(X, y)

#%%
# --------------------------
# 4. Compute SHAP values (global + local)
# --------------------------
explainer = shap.TreeExplainer(clf)
shap_values = explainer(X)

# Global feature importance (mean |SHAP|)
global_importance = np.mean(np.abs(shap_values.values), axis=0)
sorted_idx_global = np.argsort(-global_importance)

print("\n===== Global Feature Importance (mean |SHAP|) =====")
for idx in sorted_idx_global:
    print(f"{X.columns[idx]}: {global_importance[idx]:.4f}")

# Plot global feature importance
plt.figure(figsize=(8, 5))
plt.barh(
    [X.columns[i] for i in sorted_idx_global],
    global_importance[sorted_idx_global]
)
plt.title("Global SHAP Feature Importance")
plt.gca().invert_yaxis()
plt.tight_layout()
plt.show()

#%%
# --------------------------
# 5. SHAP dependence plots (used to derive cutoffs)
# --------------------------
top3 = sorted_idx_global[:3]

for idx in top3:
    feature = X.columns[idx]
    shap.dependence_plot(idx, shap_values.values, X, feature_names=X.columns)

#%%
# --------------------------
# 6. Local explanation for one patient
# --------------------------
i = 7  # index of datapoint
x_instance = X.iloc[[i]]

# Waterfall plot
shap.plots.waterfall(shap_values[i], max_display=10)

# Baseline probability (expected)
base_value = shap_values.base_values[i]
p_mean = expit(base_value)

# Instance probability
p_instance = clf.predict_proba(x_instance)[0, 1]

print(f"\nBaseline prob (expected):   {p_mean:.3f}")
print(f"Instance prob (patient {i}): {p_instance:.3f}")

#%%
# --------------------------
# 7. Local top feature ranking
# --------------------------
row_shap = shap_values[i]
abs_vals = np.abs(row_shap.values)
sorted_idx_local = np.argsort(-abs_vals)

top_features = [
    (X.columns[j], row_shap.values[j])
    for j in sorted_idx_local[:5]
]

print("\n===== Top Local Factors Influencing Risk =====")
for feat, val in top_features:
    direction = "increased" if val > 0 else "decreased"
    print(f" - {feat}: {direction} risk (SHAP={val:.3f})")
