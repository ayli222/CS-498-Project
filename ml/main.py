# %%
import numpy as np
import pandas as pd
import shap

from xgboost import XGBClassifier
from scipy.special import expit  # sigmoid
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
)

# %%
# load data
df = pd.read_csv("heart_disease.csv")

# drop obvious id column if present
if "id" in df.columns:
    df = df.drop(columns=["id"])

# simple numeric imputation
df = df.fillna(df.median(numeric_only=True))

# predict thal from the rest, excluding cp
X = df.drop(columns=["thal", "cp"])
y = df["thal"]

# %%
# 10-fold CV
X_np = X.to_numpy()
y_np = y.to_numpy()

skf = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)

accs, precs, recs, f1s, aucs = [], [], [], [], []

for train_idx, test_idx in skf.split(X_np, y_np):
    X_train, X_test = X_np[train_idx], X_np[test_idx]
    y_train, y_test = y_np[train_idx], y_np[test_idx]

    model_cv = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="binary:logistic",
        eval_metric="logloss",
        random_state=42,
    )

    model_cv.fit(X_train, y_train)

    y_pred = model_cv.predict(X_test)
    y_proba = model_cv.predict_proba(X_test)[:, 1]

    accs.append(accuracy_score(y_test, y_pred))
    precs.append(precision_score(y_test, y_pred))
    recs.append(recall_score(y_test, y_pred))
    f1s.append(f1_score(y_test, y_pred))
    aucs.append(roc_auc_score(y_test, y_proba))

print("\n10-fold CV results:")
print(f"Accuracy : {np.mean(accs):.3f} ± {np.std(accs):.3f}")
print(f"Precision: {np.mean(precs):.3f} ± {np.std(precs):.3f}")
print(f"Recall   : {np.mean(recs):.3f} ± {np.std(recs):.3f}")
print(f"F1 score : {np.mean(f1s):.3f} ± {np.std(f1s):.3f}")
print(f"ROC AUC  : {np.mean(aucs):.3f} ± {np.std(aucs):.3f}")

# %%
# fit final model on full data for SHAP
model = XGBClassifier(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="binary:logistic",
    eval_metric="logloss",
    random_state=42,
)
model.fit(X, y)

# %%
# SHAP on a single example
idx = 9  # just pick one row
x_row = X.iloc[[idx]]

explainer = shap.TreeExplainer(model)
shap_vals = explainer(X)  # shap.Explanation

# waterfall plot for this point
shap.plots.waterfall(shap_vals[idx], max_display=10)

# %%
# compare baseline vs instance probability
base_logit = shap_vals.base_values[idx]
p_baseline = expit(base_logit)

p_instance = model.predict_proba(x_row)[0, 1]

print(f"Baseline P(y=1): {p_baseline:.3f}")
print(f"Instance  P(y=1): {p_instance:.3f}")

# %%
# after shap_vals = explainer(X)

shap.plots.beeswarm(shap_vals, max_display=10)

# %%
import matplotlib.pyplot as plt
from xgboost import plot_tree

plt.figure(figsize=(14, 8))
plot_tree(model, num_trees=0, rankdir="LR")
plt.tight_layout()
plt.show()

# %%
