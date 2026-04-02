function managerEntries(entry: string[] = []) {
  return [...entry, require.resolve('./manager')];
}

module.exports = { managerEntries };
