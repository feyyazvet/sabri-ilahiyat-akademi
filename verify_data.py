import json
import os
import unicodedata

data = json.load(open("src/data/coursesData.json", encoding="utf-8"))
assert len(data) == 6, f"Expected 6 courses, got {len(data)}"

total_exams = 0
total_qs = 0
for course in data:
    assert len(course["exams"]) == 5, f"{course['id']} exam count != 5"
    for exam in course["exams"]:
        total_exams += 1
        pdf_path = os.path.join("public/pdfs", exam["pdfFile"])
        assert os.path.exists(pdf_path), f"Missing PDF: {pdf_path}"
        assert len(exam["questions"]) == 20, f"{exam['id']} q count != 20"
        for q in exam["questions"]:
            total_qs += 1
            assert q["stem"].strip(), f"Empty stem in {q['id']}"
            assert set(q["options"].keys()) == {"A", "B", "C", "D", "E"}, f"Bad options in {q['id']}"
            for k, v in q["options"].items():
                assert v.strip(), f"Empty option {k} in {q['id']}"
            assert q["correctAnswer"] in {"A", "B", "C", "D", "E", "İ"}, f"Bad answer in {q['id']}"
            assert q["explanation"].strip(), f"Empty explanation in {q['id']}"
            assert set(q["optionBreakdowns"].keys()) == {"A", "B", "C", "D", "E"}, f"Bad breakdown in {q['id']}"
            for k, v in q["optionBreakdowns"].items():
                assert v.strip(), f"Empty breakdown {k} in {q['id']}"

print(f"ALL CHECKS PASSED! {len(data)} courses, {total_exams} exams, {total_qs} verified questions.")
