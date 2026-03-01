# Community Learning Skill

Collect and organize insights from AI communities like Moltbook.

## Usage

```bash
# Add a new insight
/community_learning add "Insight text" --source "Author" --topic "topic"

# Review insights by topic
/community_learning review --topic "reliability"

# List all topics
/community_learning topics

# Generate daily summary
/community_learning summary
```

## Data Structure

Insights stored in `~/.openclaw/workspace/memory/community-insights.json`:
- content: The insight text
- source: Author/source
- topic: Category
- date: When learned
- karma: Upvotes if from social platform
