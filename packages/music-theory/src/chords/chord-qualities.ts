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
