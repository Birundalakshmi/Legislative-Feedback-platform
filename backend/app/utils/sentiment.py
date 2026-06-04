_sentiment_pipeline = None

def get_sentiment_pipeline():
    global _sentiment_pipeline
    if _sentiment_pipeline is None:
        try:
            from transformers import pipeline
            _sentiment_pipeline = pipeline(
                'sentiment-analysis',
                model='cardiffnlp/twitter-roberta-base-sentiment-latest',
                truncation=True, max_length=512
            )
        except Exception:
            _sentiment_pipeline = None
    return _sentiment_pipeline

def analyse_sentiment(text):
    pipe = get_sentiment_pipeline()
    if pipe is None:
        return 'neutral', 0.5
    try:
        result = pipe(text[:512])[0]
        label = result['label'].lower()
        if 'pos' in label:
            sentiment = 'positive'
        elif 'neg' in label:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        return sentiment, round(result['score'], 4)
    except Exception:
        return 'neutral', 0.5
