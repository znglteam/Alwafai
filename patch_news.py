with open("src/App.tsx", "r") as f:
    text = f.read()

bad_update = """    // If newly marked deceased, auto-generate Condolence ticker! (Only for brand new deceased status edits)
    if (wasAlive && !updated.isAlive) {
      const condolenceItem: NewsItem = {
        id: 'news-' + Date.now().toString(),
        type: 'condolence',
        content: `بقلوب مطمئنة راضية، نعزي عائلتنا الكريمة بوفاة المغفور له بإذن الله '${updated.name} بن ${updated.fatherName} بن ${updated.grandfatherName}'، نسأل الله له الرحمة العريضة ولنا الصبر والسلوان.`,
        createdAt: new Date().toISOString()
      };
      setNews(prev => [condolenceItem, ...prev]);
    }
  };"""
good_update = """  };"""
text = text.replace(bad_update, good_update)

bad_baby = """    // Auto-generate Baby Congratulation ticker!
    const babyCongrats: NewsItem = {
      id: 'news-' + Date.now().toString(),
      type: 'baby',
      content: `نبارك ونهنئ العضو ${childInfo.fatherName} بمناسبة قدوم المولود الجديد '${childInfo.name}'، نسأل الله أن يجعله باراً بوالديه وقرة عين لهما.`,
      createdAt: new Date().toISOString()
    };
    setNews(prev => [babyCongrats, ...prev]);
  };"""
good_baby = """  };"""
text = text.replace(bad_baby, good_baby)

with open("src/App.tsx", "w") as f:
    f.write(text)
