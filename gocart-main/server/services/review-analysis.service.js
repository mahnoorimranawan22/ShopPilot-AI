/**
 * AI Review Analysis Service
 * 
 * Analyzes product reviews for:
 * 1. Sentiment (positive / neutral / negative)
 * 2. Common topics & themes
 * 3. Keyword extraction
 * 4. Summary statistics
 * 5. Actionable insights
 */

// ─── Sentiment Lexicons ──────────────────────────────────────
const POSITIVE_WORDS = new Set([
    'love', 'great', 'excellent', 'amazing', 'awesome', 'fantastic', 'wonderful',
    'perfect', 'best', 'happy', 'pleased', 'satisfied', 'recommend', 'quality',
    'beautiful', 'impressive', 'outstanding', 'superb', 'brilliant', 'solid',
    'reliable', 'durable', 'fast', 'smooth', 'comfortable', 'easy', 'sturdy',
    'premium', 'elegant', 'sleek', 'gorgeous', 'flawless', 'exceptional',
    'terrific', 'magnificent', 'phenomenal', 'remarkable', 'incredible',
    'good', 'nice', 'fine', 'decent', 'works', 'functional', 'useful',
    'convenient', 'lightweight', 'handy', 'practical', 'worth', 'value',
    'bargain', 'steal', '划算', 'exceeded', 'expectations', 'wow',
])

const NEGATIVE_WORDS = new Set([
    'bad', 'poor', 'terrible', 'horrible', 'awful', 'worst', 'hate',
    'disappointed', 'disappointing', 'broken', 'defective', 'damaged',
    'cheap', 'flimsy', 'fragile', 'waste', 'useless', 'junk', 'trash',
    'refund', 'return', 'complaint', 'issue', 'problem', 'fail', 'failed',
    'malfunction', 'stopped', 'died', 'dead', 'crash', 'crashes', 'bug',
    'slow', 'laggy', 'lag', 'freezing', 'freeze', 'overpriced', 'expensive',
    'ripoff', 'scam', 'misleading', 'fake', 'worse', 'regret', 'annoying',
    'frustrating', 'frustrated', 'uncomfortable', 'heavy', 'bulky',
    'ugly', 'clunky', 'noisy', 'loud', 'hot', 'overheats', 'bulky',
    'difficult', 'complicated', 'confusing', 'missing', 'incomplete',
])

const NEUTRAL_WORDS = new Set([
    'okay', 'ok', 'fine', 'average', 'mediocre', 'acceptable', 'adequate',
    'standard', 'normal', 'typical', 'ordinary', 'moderate', 'fair',
    'nothing special', 'it works', 'as expected', 'as described',
])

// ─── Topic Detection ─────────────────────────────────────────
const TOPIC_KEYWORDS = {
    'Product Quality': ['quality', 'build', 'material', 'construction', 'craftsmanship', 'solid', 'sturdy', 'durable', 'fragile', 'flimsy', 'well-made', 'well made'],
    'Design': ['design', 'look', 'looks', 'style', 'aesthetic', 'beautiful', 'ugly', 'sleek', 'elegant', 'modern', 'color', 'colour', 'appearance', 'compact'],
    'Price': ['price', 'cost', 'value', 'expensive', 'cheap', 'affordable', 'overpriced', 'worth', 'money', 'budget', 'bargain', 'deal'],
    'Delivery': ['delivery', 'shipping', 'arrived', 'package', 'packaging', 'box', 'courier', 'fast delivery', 'late', 'delayed', 'damaged in transit'],
    'Packaging': ['packaging', 'package', 'box', 'wrapping', 'bubble wrap', 'unboxing', 'damaged package', 'well packaged', 'poor packaging', 'torn'],
    'Battery Life': ['battery', 'charge', 'charging', 'battery life', 'lasts', 'hours', 'mah', 'fast charge', 'drain'],
    'Sound Quality': ['sound', 'audio', 'bass', 'treble', 'volume', 'loud', 'clear', 'noise', 'cancellation', 'noise cancelling'],
    'Customer Service': ['service', 'support', 'customer service', 'response', 'help', 'support team', 'warranty', 'replacement'],
    'Ease of Use': ['easy', 'simple', 'intuitive', 'user-friendly', 'complicated', 'difficult', 'setup', 'install', 'configure'],
    'Performance': ['performance', 'speed', 'fast', 'slow', 'responsive', 'lag', 'smooth', 'powerful', 'efficient'],
    'Comfort': ['comfort', 'comfortable', 'fit', 'fits', 'weight', 'light', 'heavy', 'ergonomic', 'snug', 'tight'],
    'Connectivity': ['bluetooth', 'wifi', 'connection', 'connect', 'pairing', 'pair', 'disconnect', 'stable connection'],
}

// ─── Analyze Sentiment ───────────────────────────────────────
function analyzeSentiment(text) {
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/)
    let positive = 0
    let negative = 0
    let neutral = 0

    for (const word of words) {
        if (POSITIVE_WORDS.has(word)) positive++
        else if (NEGATIVE_WORDS.has(word)) negative++
        else if (NEUTRAL_WORDS.has(word)) neutral++
    }

    // Check for negation (e.g., "not good")
    const negationPatterns = ['not', 'no', 'never', "don't", "doesn't", "didn't", "won't", "wouldn't", "couldn't", "shouldn't"]
    for (let i = 0; i < words.length - 1; i++) {
        if (negationPatterns.includes(words[i])) {
            if (POSITIVE_WORDS.has(words[i + 1])) {
                positive--
                negative++
            } else if (NEGATIVE_WORDS.has(words[i + 1])) {
                negative--
                positive++
            }
        }
    }

    // Check for intensifiers
    const intensifiers = ['very', 'really', 'extremely', 'absolutely', 'totally', 'incredibly']
    for (let i = 0; i < words.length - 1; i++) {
        if (intensifiers.includes(words[i])) {
            if (POSITIVE_WORDS.has(words[i + 1])) positive += 0.5
            if (NEGATIVE_WORDS.has(words[i + 1])) negative += 0.5
        }
    }

    const total = positive + negative + neutral
    if (total === 0) return 'neutral'

    const score = (positive - negative) / total

    if (score > 0.15) return 'positive'
    if (score < -0.15) return 'negative'
    return 'neutral'
}

// ─── Extract Topics ──────────────────────────────────────────
function extractTopics(text) {
    const lower = text.toLowerCase()
    const found = []

    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        for (const kw of keywords) {
            if (lower.includes(kw)) {
                found.push(topic)
                break
            }
        }
    }

    return found
}

// ─── Extract Keywords ────────────────────────────────────────
function extractKeywords(reviews) {
    const wordCounts = {}
    const stopWords = new Set(['the', 'a', 'an', 'is', 'it', 'to', 'and', 'of', 'in', 'for', 'on', 'with', 'this', 'that', 'i', 'my', 'me', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'its', 'not', 'but', 'or', 'so', 'if', 'at', 'by', 'from', 'as', 'into', 'than', 'then', 'also', 'just', 'about', 'very', 'too', 'you', 'your', 'we', 'our', 'they', 'them', 'their', 'what', 'which', 'who', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'only', 'own', 'same', 'after', 'before', 'between', 'through', 'during', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'once', 'here', 'there', 'when', 'where', 'why', 'while', 'get', 'got', 'one', 'two', 'use', 'used', 'using'])

    for (const review of reviews) {
        const text = (review.review || review.text || '').toLowerCase().replace(/[^a-z0-9\s]/g, '')
        const words = text.split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w))

        for (const word of words) {
            wordCounts[word] = (wordCounts[word] || 0) + 1
        }
    }

    return Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([word, count]) => ({ word, count }))
}

// ─── Generate Insights ───────────────────────────────────────
function generateInsights(sentimentCounts, topicCounts, totalReviews, avgRating) {
    const insights = []

    // Sentiment insight
    const positivePercent = Math.round((sentimentCounts.positive / totalReviews) * 100)
    const negativePercent = Math.round((sentimentCounts.negative / totalReviews) * 100)

    if (positivePercent >= 80) {
        insights.push({ type: 'success', text: `Excellent! ${positivePercent}% of reviews are positive.` })
    } else if (positivePercent >= 60) {
        insights.push({ type: 'info', text: `${positivePercent}% positive reviews — good, but there's room to improve.` })
    } else {
        insights.push({ type: 'warning', text: `Only ${positivePercent}% positive reviews — investigate common complaints.` })
    }

    if (negativePercent > 15) {
        insights.push({ type: 'error', text: `${negativePercent}% negative reviews need attention.` })
    }

    // Topic insights
    const positiveTopics = Object.entries(topicCounts)
        .filter(([_, data]) => data.positive > data.negative)
        .sort((a, b) => b[1].positive - a[1].positive)

    const negativeTopics = Object.entries(topicCounts)
        .filter(([_, data]) => data.negative > 0)
        .sort((a, b) => b[1].negative - a[1].negative)

    if (positiveTopics.length > 0) {
        const top = positiveTopics.slice(0, 3).map(([topic]) => topic)
        insights.push({ type: 'success', text: `Customers love: ${top.join(', ')}` })
    }

    if (negativeTopics.length > 0) {
        const issues = negativeTopics.slice(0, 3).map(([topic]) => topic)
        insights.push({ type: 'warning', text: `Needs improvement: ${issues.join(', ')}` })
    }

    // Rating insight
    if (avgRating >= 4.5) {
        insights.push({ type: 'success', text: `Outstanding average rating of ${avgRating.toFixed(1)}★` })
    } else if (avgRating >= 4.0) {
        insights.push({ type: 'info', text: `Good average rating of ${avgRating.toFixed(1)}★` })
    } else if (avgRating < 3.5) {
        insights.push({ type: 'warning', text: `Average rating of ${avgRating.toFixed(1)}★ needs improvement` })
    }

    return insights
}

// ─── Main: Analyze Reviews ───────────────────────────────────
export function analyzeReviews(reviews) {
    if (!reviews || reviews.length === 0) {
        return {
            totalReviews: 0,
            sentiment: { positive: 0, neutral: 0, negative: 0, positivePercent: 0, neutralPercent: 0, negativePercent: 0 },
            topics: [],
            keywords: [],
            insights: [],
            avgRating: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        }
    }

    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 }
    const topicCounts = {}
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    let totalRating = 0

    for (const review of reviews) {
        const text = review.review || review.text || ''
        const sentiment = analyzeSentiment(text)
        sentimentCounts[sentiment]++

        // Topics
        const topics = extractTopics(text)
        for (const topic of topics) {
            if (!topicCounts[topic]) {
                topicCounts[topic] = { positive: 0, neutral: 0, negative: 0, total: 0 }
            }
            topicCounts[topic][sentiment]++
            topicCounts[topic].total++
        }

        // Rating
        const rating = review.rating || 0
        if (rating >= 1 && rating <= 5) {
            ratingDistribution[Math.round(rating)]++
            totalRating += rating
        }
    }

    const totalReviews = reviews.length
    const avgRating = totalRating / totalReviews

    // Sentiment percentages
    const sentiment = {
        positive: sentimentCounts.positive,
        neutral: sentimentCounts.neutral,
        negative: sentimentCounts.negative,
        positivePercent: Math.round((sentimentCounts.positive / totalReviews) * 100),
        neutralPercent: Math.round((sentimentCounts.neutral / totalReviews) * 100),
        negativePercent: Math.round((sentimentCounts.negative / totalReviews) * 100),
    }

    // Topic list sorted by mention count
    const topics = Object.entries(topicCounts)
        .map(([name, data]) => ({
            name,
            count: data.total,
            positive: data.positive,
            neutral: data.neutral,
            negative: data.negative,
            sentiment: data.positive > data.negative ? 'positive' : data.negative > data.positive ? 'negative' : 'neutral',
        }))
        .sort((a, b) => b.count - a.count)

    // Keywords
    const keywords = extractKeywords(reviews)

    // Insights
    const insights = generateInsights(sentimentCounts, topicCounts, totalReviews, avgRating)

    return {
        totalReviews,
        sentiment,
        topics,
        keywords,
        insights,
        avgRating: Math.round(avgRating * 10) / 10,
        ratingDistribution,
    }
}
