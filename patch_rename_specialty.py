import os

directory = "src/components/"
for filename in os.listdir(directory):
    if filename.endswith(".tsx"):
        filepath = os.path.join(directory, filename)
        with open(filepath, "r") as f:
            text = f.read()
            
        text = text.replace("التوزيع حسب مجال العمل", "التخصص المهني/العلمي")
        text = text.replace("مجال العمل أو المهنة", "التخصص المهني/العلمي")
        text = text.replace("مجال العمل", "التخصص المهني/العلمي")
        
        with open(filepath, "w") as f:
            f.write(text)
