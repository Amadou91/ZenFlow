const getLevelColor = (level) => {
  switch (level) {
    case 0:
      return 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300';
    case 1:
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 2:
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 3:
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
    default:
      return 'bg-stone-100 text-stone-600';
  }
};

export default getLevelColor;
