let memories = [];

export const addMemory = (memory) => {
  memories.push({ id: Date.now(), ...memory });
};

export const getMemories = () => {
  return memories;
};