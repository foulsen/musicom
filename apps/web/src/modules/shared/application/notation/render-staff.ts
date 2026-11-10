import type { VexNoteSpec, VexPassageSpec } from "./vexflow-spec";

/**
 * Tudo que é específico do VexFlow fica aqui e no componente `staff-notation`.
 * A lib é carregada sob demanda (chunk separado) e memoizada.
 */
type VexFlowModule = typeof import("vexflow/bravura");

export type StaffHighlightKind = "active" | "correct" | "wrong";

export interface StaffColors {
  ink: string;
  active: string;
  correct: string;
  wrong: string;
}

export interface RenderStaffOptions {
  width: number;
  colors: StaffColors;
  highlights?: Record<string, StaffHighlightKind>;
  compact?: boolean;
  ariaLabel?: string;
}

/** Largura mínima de um compasso (em px) para decidir quantos cabem por linha. */
const MEASURE_MIN_WIDTH = 220;
const COMPACT_MEASURE_MIN_WIDTH = 160;
const COMPACT_SCALE = 0.8;
/** Altura reservada por linha de pauta (linhas suplementares, dinâmicas e quiálteras). */
const ROW_HEIGHT = 170;
const ROW_TOP_OFFSET = 30;
const SIDE_PADDING = 10;
const FONTS = ["Bravura", "Academico"] as const;

let vexflowPromise: Promise<VexFlowModule> | null = null;

export function loadVexflow(): Promise<VexFlowModule> {
  if (!vexflowPromise) {
    vexflowPromise = import("vexflow/bravura").then(async (module) => {
      await module.default.loadFonts(...FONTS);
      module.default.setFonts(...FONTS);

      return module;
    });
    // Permite nova tentativa se o carregamento falhar (rede, por exemplo).
    vexflowPromise.catch(() => {
      vexflowPromise = null;
    });
  }

  return vexflowPromise;
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];

  for (let start = 0; start < items.length; start += size) {
    rows.push(items.slice(start, start + size));
  }

  return rows;
}

interface BuiltNote {
  spec: VexNoteSpec;
  note: InstanceType<VexFlowModule["StaveNote"]>;
  row: number;
}

export function renderStaff(element: HTMLElement, spec: VexPassageSpec, options: RenderStaffOptions, vf: VexFlowModule): void {
  const { width, colors, highlights = {}, compact = false } = options;
  const scale = compact ? COMPACT_SCALE : 1;
  const layoutWidth = Math.max(120, width / scale);
  const minMeasureWidth = compact ? COMPACT_MEASURE_MIN_WIDTH : MEASURE_MIN_WIDTH;
  const perRow = Math.max(1, Math.floor(layoutWidth / minMeasureWidth));
  const rows = chunk(spec.measures, perRow);
  const height = rows.length * ROW_HEIGHT;

  element.replaceChildren();

  const renderer = new vf.Renderer(element as HTMLDivElement, vf.Renderer.Backends.SVG);
  renderer.resize(width, height * scale);
  const context = renderer.getContext();
  context.scale(scale, scale);
  context.setFillStyle(colors.ink);
  context.setStrokeStyle(colors.ink);

  const inkStyle = { fillStyle: colors.ink, strokeStyle: colors.ink };
  const highlightColor = { active: colors.active, correct: colors.correct, wrong: colors.wrong };
  const built: BuiltNote[] = [];
  const beams: InstanceType<VexFlowModule["Beam"]>[] = [];
  const tuplets: InstanceType<VexFlowModule["Tuplet"]>[] = [];
  const drawers: (() => void)[] = [];

  rows.forEach((rowMeasures, rowIndex) => {
    const y = rowIndex * ROW_HEIGHT + ROW_TOP_OFFSET;
    const usableWidth = layoutWidth - SIDE_PADDING * 2;

    // Largura da área das notas por compasso é igual em todas as linhas; só o primeiro
    // compasso de cada linha ganha o espaço extra de clave/armadura/fórmula.
    const probe = new vf.Stave(SIDE_PADDING, y, usableWidth);
    probe.addClef(spec.clef).addKeySignature(spec.keySpec);
    if (rowIndex === 0 && spec.timeSpec) probe.addTimeSignature(spec.timeSpec);
    const headerWidth = probe.getNoteStartX() - SIDE_PADDING;
    const noteAreaWidth = (usableWidth - headerWidth) / perRow;

    let x = SIDE_PADDING;

    rowMeasures.forEach((measure, columnIndex) => {
      const isFirst = columnIndex === 0;
      const stave = new vf.Stave(x, y, isFirst ? headerWidth + noteAreaWidth : noteAreaWidth);

      if (isFirst) {
        stave.addClef(spec.clef).addKeySignature(spec.keySpec);
        if (rowIndex === 0 && spec.timeSpec) stave.addTimeSignature(spec.timeSpec);
      }

      stave.setStyle(inkStyle);
      stave.setContext(context);
      x += stave.getWidth();

      const notes = measure.notes.map((noteSpec) => {
        const note = new vf.StaveNote({
          keys: noteSpec.keys,
          duration: noteSpec.duration,
          clef: spec.clef,
          autoStem: true,
        });

        noteSpec.accidentals.forEach((mark, index) => {
          if (mark) note.addModifier(new vf.Accidental(mark), index);
        });

        for (let dot = 0; dot < noteSpec.dots; dot++) {
          vf.Dot.buildAndAttach([note], { all: true });
        }

        for (const code of noteSpec.articulations) {
          const articulation = new vf.Articulation(code);
          articulation.setPosition(vf.Modifier.Position.ABOVE);
          note.addModifier(articulation, 0);
        }

        if (noteSpec.dynamic) {
          const dynamic = new vf.Annotation(noteSpec.dynamic);
          dynamic.setFont("serif", 13, "bold", "italic");
          dynamic.setVerticalJustification(vf.Annotation.VerticalJustify.BOTTOM);
          note.addModifier(dynamic, 0);
        }

        const highlight = highlights[noteSpec.key];
        const color = highlight ? highlightColor[highlight] : colors.ink;
        note.setStyle({ fillStyle: color, strokeStyle: color });
        built.push({ spec: noteSpec, note, row: rowIndex });

        return note;
      });

      // Quiálteras: notas consecutivas com a mesma razão, em grupos de `actual`.
      let run: typeof notes = [];
      let runTuplet = null as VexNoteSpec["tuplet"];
      const flushRun = () => {
        run = [];
        runTuplet = null;
      };

      measure.notes.forEach((noteSpec, index) => {
        if (!noteSpec.tuplet) {
          flushRun();
          return;
        }

        if (runTuplet && (runTuplet.actual !== noteSpec.tuplet.actual || runTuplet.normal !== noteSpec.tuplet.normal)) {
          flushRun();
        }

        runTuplet = noteSpec.tuplet;
        run.push(notes[index]);

        if (run.length === runTuplet.actual) {
          tuplets.push(new vf.Tuplet(run, { numNotes: runTuplet.actual, notesOccupied: runTuplet.normal }));
          flushRun();
        }
      });

      // Compasso sem notas (só clave e armadura): a pauta é desenhada sem voz nem formatação.
      if (notes.length === 0) {
        drawers.push(() => stave.draw());

        return;
      }

      const voice = new vf.Voice({ numBeats: Math.max(1, notes.length), beatValue: 4 }).setMode(vf.Voice.Mode.SOFT);
      voice.addTickables(notes);

      const groups = spec.compound ? [new vf.Fraction(3, 8)] : [new vf.Fraction(1, 4)];
      beams.push(...vf.Beam.generateBeams(notes, { groups }));

      new vf.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      drawers.push(() => {
        stave.draw();
        voice.draw(context, stave);
      });
    });
  });

  drawers.forEach((draw) => draw());
  beams.forEach((beam) => beam.setContext(context).draw());
  tuplets.forEach((tuplet) => tuplet.setContext(context).draw());

  // Ligaduras: entre uma nota e a próxima (inclusive entre compassos); se cruzam linhas,
  // desenha-se a metade final da primeira e a metade inicial da segunda.
  built.forEach((current, index) => {
    if (!current.spec.tieToNext) return;

    const next = built[index + 1];
    if (!next || next.spec.isRest) return;

    const firstIndexes = current.spec.keys.map((_key, keyIndex) => keyIndex);
    const lastIndexes = next.spec.keys.map((_key, keyIndex) => keyIndex);
    const ties =
      current.row === next.row
        ? [{ firstNote: current.note, lastNote: next.note, firstIndexes, lastIndexes }]
        : [
            { firstNote: current.note, lastNote: null, firstIndexes, lastIndexes: firstIndexes },
            { firstNote: null, lastNote: next.note, firstIndexes: lastIndexes, lastIndexes },
          ];

    for (const tie of ties) {
      new vf.StaveTie(tie).setStyle(inkStyle).setContext(context).draw();
    }
  });

  const svg = element.querySelector("svg");

  if (svg) {
    svg.setAttribute("role", "img");
    if (options.ariaLabel) svg.setAttribute("aria-label", options.ariaLabel);
  }
}
