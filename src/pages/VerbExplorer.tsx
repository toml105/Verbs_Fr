import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { verbs } from '../data/verbs';
import { useProgress } from '../context/UserProgressContext';
import SearchInput from '../components/ui/SearchInput';
import VerbCard from '../components/verbs/VerbCard';

type FilterGroup = 'all' | '1' | '2' | '3';
type FilterDifficulty = 'all' | '1' | '2' | '3';
type SortBy = 'alpha' | 'difficulty' | 'mastery';

export default function VerbExplorer() {
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState<FilterGroup>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<FilterDifficulty>('all');
  const [sortBy, setSortBy] = useState<SortBy>('alpha');
  const { getVerbMastery } = useProgress();

  const filtered = useMemo(() => {
    let result = [...verbs];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.infinitive.toLowerCase().includes(q) ||
          v.english.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Filter group
    if (filterGroup !== 'all') {
      result = result.filter((v) => v.group === Number(filterGroup));
    }

    // Filter difficulty
    if (filterDifficulty !== 'all') {
      result = result.filter((v) => v.difficulty === Number(filterDifficulty));
    }

    // Sort
    switch (sortBy) {
      case 'alpha':
        result.sort((a, b) => a.infinitive.localeCompare(b.infinitive));
        break;
      case 'difficulty':
        result.sort((a, b) => a.difficulty - b.difficulty);
        break;
      case 'mastery':
        result.sort((a, b) => getVerbMastery(b.id) - getVerbMastery(a.id));
        break;
    }

    return result;
  }, [search, filterGroup, filterDifficulty, sortBy, getVerbMastery]);

  const chipClass = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
      active
        ? 'bg-coral-500 text-white'
        : 'bg-warm-100 text-warm-600 dark:bg-warm-800 dark:text-warm-400'
    }`;

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-warm-800 dark:text-warm-100 mb-4">
          Verb Explorer
        </h1>
        <SearchInput value={search} onChange={setSearch} />
      </motion.div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button className={chipClass(filterGroup === 'all')} onClick={() => setFilterGroup('all')}>All Groups</button>
          <button className={chipClass(filterGroup === '1')} onClick={() => setFilterGroup('1')}>1st (-er)</button>
          <button className={chipClass(filterGroup === '2')} onClick={() => setFilterGroup('2')}>2nd (-ir)</button>
          <button className={chipClass(filterGroup === '3')} onClick={() => setFilterGroup('3')}>3rd (irr)</button>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button className={chipClass(filterDifficulty === 'all')} onClick={() => setFilterDifficulty('all')}>All Levels</button>
          <button className={chipClass(filterDifficulty === '1')} onClick={() => setFilterDifficulty('1')}>Beginner</button>
          <button className={chipClass(filterDifficulty === '2')} onClick={() => setFilterDifficulty('2')}>Intermediate</button>
          <button className={chipClass(filterDifficulty === '3')} onClick={() => setFilterDifficulty('3')}>Advanced</button>
        </div>
        <div className="flex gap-2">
          <button className={chipClass(sortBy === 'alpha')} onClick={() => setSortBy('alpha')}>A-Z</button>
          <button className={chipClass(sortBy === 'difficulty')} onClick={() => setSortBy('difficulty')}>Difficulty</button>
          <button className={chipClass(sortBy === 'mastery')} onClick={() => setSortBy('mastery')}>Mastery</button>
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-warm-400">
        {filtered.length} verb{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Verb list */}
      <div className="space-y-2">
        {filtered.map((verb, i) => (
          <VerbCard key={verb.id} verb={verb} index={i} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-warm-400">
            No verbs found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
