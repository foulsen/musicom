import { ChordQuality } from "./chord-quality";

// Tríades
export const MAJOR = new ChordQuality("");

export const MINOR = new ChordQuality("m");

export const DIMINISHED = new ChordQuality("dim");

export const AUGMENTED = new ChordQuality("aug");

export const SUS2 = new ChordQuality("sus2");

export const SUS4 = new ChordQuality("sus4");

// Sextas
export const SIXTH = new ChordQuality("6");

export const MINOR_SIXTH = new ChordQuality("m6");

// Sétimas
export const MAJOR_7 = new ChordQuality("maj7");

export const MINOR_7 = new ChordQuality("m7");

export const DOMINANT_7 = new ChordQuality("7");

export const HALF_DIMINISHED = new ChordQuality("m7b5");

export const DIMINISHED_7 = new ChordQuality("dim7");

export const MINOR_MAJOR_7 = new ChordQuality("mMaj7");

// Estendidas
export const DOMINANT_9 = new ChordQuality("9");

export const MAJOR_9 = new ChordQuality("maj9");

export const MINOR_9 = new ChordQuality("m9");

export const DOMINANT_11 = new ChordQuality("11");

export const DOMINANT_13 = new ChordQuality("13");

// Alteradas (dominantes com 5ª/9ª alterada)
export const DOMINANT_7_FLAT_9 = new ChordQuality("7b9");

export const DOMINANT_7_SHARP_9 = new ChordQuality("7#9");

export const DOMINANT_7_FLAT_5 = new ChordQuality("7b5");

export const DOMINANT_7_SHARP_5 = new ChordQuality("7#5");

// Acréscimos
export const ADD_9 = new ChordQuality("add9");

export const ADD_11 = new ChordQuality("add11");
