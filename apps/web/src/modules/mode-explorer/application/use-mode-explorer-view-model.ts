import { computed } from "vue";
import { storeToRefs } from "pinia";

import type { FretboardNote } from "@/modules/shared/types/fretboard-note";
import type { ChordCardData } from "@/modules/shared/types/chord-shape";

import {
  Fretboard,
  Interval,
  Note,
  STANDARD_GUITAR_TUNING,
  relativeModesOf,
} from "@music-workspace/music-theory";

import { resolveChordCard } from "@/modules/shared/application/chord-cards";

import { useModeExplorerStore } from "./use-mode-explorer-store";

/** Ordem de "brilho" dos 7 modos do sistema maior, do mais brilhante ao mais escuro. */
const BRIGHTNESS_ORDER = ["Lydian", "Ionian", "Mixolydian", "Dorian", "Aeolian", "Phrygian", "Locrian"];

export function useModeExplorerViewModel() {
  const store = useModeExplorerStore();
  const {
    parentRootValue,
    modeIndex,
    fretCount,
    selectedTriadIndex: storedTriadIndex,
  } = storeToRefs(store);

  const selectedParentRoot = computed<Note>({
    get: () => Note.from(parentRootValue.value),
    set: (note) => {
      parentRootValue.value = note.value;
    },
  });

  const modes = computed(() => relativeModesOf(selectedParentRoot.value));

  const selectedModeIndex = computed<number>({
    get: () => Math.min(modeIndex.value, modes.value.length - 1),
    set: (index) => {
      modeIndex.value = index;
    },
  });

  const selectedMode = computed(() => modes.value[selectedModeIndex.value]);

  const scale = computed(() => selectedMode.value.scale);

  const notes = computed(() => scale.value.notes());

  const degrees = computed(() => scale.value.degrees());

  const triads = computed(() => scale.value.triads());

  const brightnessRank = computed(() => BRIGHTNESS_ORDER.indexOf(selectedMode.value.pattern.name));

  const fretboard = computed(() => new Fretboard(STANDARD_GUITAR_TUNING, fretCount.value));

  /** Grafia enarmônica por classe de altura, derivada do modo selecionado. */
  const spelledByPitchClass = computed(() => {
    const map = new Map<number, string>();
    scale.value.spelledNotes().forEach((spelled) => {
      map.set(spelled.pitchClass(), spelled.toString());
    });
    return map;
  });

  const fretboardPositions = computed<FretboardNote[][]>(() => {
    return fretboard.value.positions().map((row) =>
      row.map((position) => {
        const note = position.pitch.note;

        return {
          ...position,
          label: spelledByPitchClass.value.get(note.index()) ?? note.toString(),
          isTonic: note.equals(scale.value.root),
          inScale: scale.value.contains(note),
          intervalName: new Interval(scale.value.root.distanceTo(note)).name(),
        };
      }),
    );
  });

  const selectedTriadIndex = computed({
    get: () => Math.min(storedTriadIndex.value, triads.value.length - 1),
    set: (index) => {
      storedTriadIndex.value = index;
    },
  });

  const selectedChord = computed(() => triads.value[selectedTriadIndex.value] ?? triads.value[0]);

  const selectedChordCard = computed<ChordCardData | null>(() => resolveChordCard(selectedChord.value.name));

  function selectParentRoot(note: Note) {
    selectedParentRoot.value = note;
  }

  function selectMode(index: number) {
    selectedModeIndex.value = index;
  }

  function selectChord(index: number) {
    selectedTriadIndex.value = index;
  }

  return {
    selectedParentRoot,
    modes,
    selectedModeIndex,
    selectedMode,

    brightnessRank,
    brightnessOrder: BRIGHTNESS_ORDER,

    scale,
    notes,
    degrees,
    triads,

    fretboardPositions,
    fretCount,

    selectedTriadIndex,
    selectedChord,
    selectedChordCard,

    selectParentRoot,
    selectMode,
    selectChord,
  };
}
