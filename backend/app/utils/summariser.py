def summarise_comments(comments, sentence_count=5):
    try:
        from sumy.parsers.plaintext import PlaintextParser
        from sumy.nlp.tokenizers import Tokenizer
        from sumy.summarizers.lsa import LsaSummarizer
        import nltk
        nltk.download('punkt', quiet=True)
        nltk.download('punkt_tab', quiet=True)

        text = ' '.join(comments)
        if not text.strip():
            return 'No comments available for summarisation.'
        parser = PlaintextParser.from_string(text, Tokenizer('english'))
        summarizer = LsaSummarizer()
        summary = summarizer(parser.document, sentence_count)
        result = ' '.join(str(s) for s in summary)
        return result if result else 'Unable to generate summary.'
    except Exception as e:
        return f'Summary unavailable: {str(e)}'


def extract_keywords(comments, top_n=50):
    import re
    from collections import Counter
    STOPWORDS = {
        'the','a','an','and','or','but','in','on','at','to','for','of','with',
        'is','are','was','were','be','been','being','have','has','had','do','does',
        'did','will','would','could','should','may','might','shall','can','this',
        'that','these','those','it','its','we','our','they','their','i','my','you',
        'your','he','his','she','her','not','no','so','as','if','by','from','up',
        'about','into','through','during','before','after','above','below','between',
        'out','off','over','under','again','further','then','once','also','very',
        'just','more','most','other','some','such','than','too','only','same','both'
    }
    text = ' '.join(comments).lower()
    words = re.findall(r'\b[a-z]{4,}\b', text)
    filtered = [w for w in words if w not in STOPWORDS]
    counter = Counter(filtered)
    return [{'text': w, 'value': c} for w, c in counter.most_common(top_n)]
