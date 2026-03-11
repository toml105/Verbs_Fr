import type { Example } from '../../types';

interface ExampleSentenceProps {
  example: Example;
}

export default function ExampleSentence({ example }: ExampleSentenceProps) {
  return (
    <div className="py-3 border-b border-warm-100 dark:border-warm-700 last:border-0">
      <p className="text-warm-800 dark:text-warm-100 font-medium">
        {example.french}
      </p>
      <p className="text-sm text-warm-500 dark:text-warm-400 mt-1">
        {example.english}
      </p>
      <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-warm-100 dark:bg-warm-700 text-warm-500 dark:text-warm-400">
        {example.tense.replace(/_/g, ' ').toLowerCase()}
      </span>
    </div>
  );
}
