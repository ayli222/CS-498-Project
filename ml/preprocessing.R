data <- read.csv("heart_disease_uci.csv")

clean_data <- data[c(1:3, 5, 6, 8, 15)]

hist(data$age)
clean_data$sex = ifelse(data$sex == "Male", 0, 1)
clean_data$thal <- ifelse(data$thal == "normal" | is.na(data$thal) | data$thal == "", 0, 1)
clean_data$fbs = as.numeric(clean_data$fbs)
clean_data$cp <- ifelse(data$cp == "asymptomatic", 0, 1)

write.csv(clean_data, "heart_disease.csv", row.names = FALSE)

hist(clean_data$sex)

table(clean_data$fbs, clean_data$thal)