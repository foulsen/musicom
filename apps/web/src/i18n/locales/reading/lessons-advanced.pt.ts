import type { DeepStringify } from "../deep-stringify";
import type { readingAdvancedLessonsEn } from "./lessons-advanced.en";

export const readingAdvancedLessonsPt: DeepStringify<typeof readingAdvancedLessonsEn> = {
  lessons: {
    readingChords: {
      title: "Intervalos e acordes na pauta",
      summary: "Veja terças como linhas ou espaços empilhados e reconheça uma tríade num relance.",
      steps: {
        intervalsOnStaff: {
          title: "Intervalos na pauta",
          body: "Duas notas escritas uma sobre a outra formam um [[interval:intervalo]]. Para nomeá-lo, conte todas as linhas e espaços da nota de baixo até a de cima, incluindo as duas: essa contagem é o número do intervalo. Um atalho útil: quando as duas notas estão em linhas (ou as duas em espaços), o intervalo é ímpar — uma 3ª, 5ª ou 7ª. Quando uma está numa linha e a outra num espaço, ele é par — uma 2ª, 4ª, 6ª ou uma oitava.",
          captionOdd: "De linha a linha: uma 3ª e depois uma 5ª.",
          captionEven: "De linha a espaço: uma 4ª e depois uma 6ª.",
        },
        stackedTriads: {
          title: "Terças empilhadas formam uma tríade",
          body: "Uma [[triad:tríade]] são três notas empilhadas em terças. Em posição fundamental, suas notas ficam em três linhas vizinhas ou em três espaços vizinhos, sem buracos, então o acorde parece uma torre arrumada na pauta. A nota mais grave é a fundamental: a que dá nome ao acorde.",
          captionLines: "Três linhas: E-G-B e depois G-B-D.",
          captionSpaces: "Três espaços: F-A-C e depois A-C-E.",
        },
        namingChords: {
          title: "Dando nome aos acordes de C maior",
          body: "Construa uma tríade sobre cada nota da escala de C maior, usando só as notas da escala, e você obtém os sete acordes do tom: C, Dm, Em, F, G, Am e B diminuto. Todos parecem a mesma torre na pauta, mas a distância exata entre as notas muda a qualidade. Por isso a letra da fundamental e a armadura de clave decidem o nome. Toque o exemplo para ouvi-los em ordem.",
          caption: "C, Dm, Em, F, depois G, Am, Bdim e C.",
        },
      },
    },
    readingExpression: {
      title: "Dinâmica, articulação e andamento",
      summary: "Os sinais que dizem quão forte, quão curto e quão rápido tocar.",
      steps: {
        dynamics: {
          title: "Quão forte: a dinâmica",
          body: "A [[dynamics:dinâmica]] indica o volume. Ela é escrita abaixo da pauta com abreviaturas de palavras italianas: pp (muito suave), p (suave), mp (moderadamente suave), mf (moderadamente forte), f (forte) e ff (muito forte). Uma mudança gradual aparece como um sinal de crescendo (cada vez mais forte) ou de diminuendo (cada vez mais suave), ou com as palavras cresc. e dim.",
          caption: "De pp a ff: cada marcação é um degrau mais forte.",
        },
        articulations: {
          title: "Quão curto ou longo: a articulação",
          body: "A [[articulation:articulação]] muda a forma como uma nota é atacada e sustentada. Um ponto é staccato (curta e destacada). Um traço horizontal curto é tenuto (sustente o valor inteiro, com leve ênfase). O sinal > é um acento (ataque mais forte) e o sinal ^ é marcato (acento forte e curto). A fermata, o arco com um ponto, prolonga a nota além do escrito.",
          caption: "Staccato, acento, tenuto e marcato, depois uma fermata.",
        },
        tempo: {
          title: "Quão rápido: o andamento",
          body: "O andamento é a velocidade do [[beat:pulso]], medida em batidas por minuto (BPM): 60 BPM é uma batida por segundo. As partituras costumam trazer uma palavra italiana, muitas vezes com um número. Largo é muito lento (cerca de 40-60 BPM), Adagio lento (66-76), Andante em passo de caminhada (76-108), Moderato moderado (108-120), Allegro rápido (120-156) e Presto muito rápido (168-200). Toque os dois exemplos: as mesmas notas, em dois andamentos.",
          captionSlow: "Largo: 52 BPM.",
          captionFast: "Allegro: 144 BPM.",
        },
      },
    },
    readingCClefs: {
      title: "Claves de dó: viola e tenor",
      summary: "Claves que apontam para o dó central, lidas por violas, violoncelos e trombones.",
      steps: {
        cClef: {
          title: "Uma clave que aponta para o dó central",
          body: "A [[clef:clave]] de sol se enrola na nota G e a de fá marca o F. A clave de dó marca o dó central (C4): o centro do sinal fica na linha que é o C4. Como esse centro pode ficar em linhas diferentes, o mesmo símbolo forma claves diferentes. Compare a mesma nota, o dó central, em três claves: abaixo da pauta numa linha suplementar na clave de sol, na linha do meio na clave de dó na 3ª linha e na quarta linha na clave de dó na 4ª linha.",
          captionTreble: "Clave de sol: o C4 numa linha suplementar abaixo da pauta.",
          captionAlto: "Clave de dó na 3ª linha: o C4 na linha do meio.",
          captionTenor: "Clave de dó na 4ª linha: o C4 na quarta linha.",
        },
        altoClef: {
          title: "Clave de dó na 3ª linha: a linha do meio é C",
          body: "Na clave de dó na 3ª linha (a clave de viola) a linha do meio é o dó central. Leia a partir dela: um grau acima é D, um grau abaixo é B. As violas leem nessa clave, e por isso as notas do registro médio cabem na pauta sem linhas suplementares. Experimente esta melodia, que vai de A até E e volta.",
          caption: "Clave de dó na 3ª linha: a linha do meio é o C4.",
        },
        tenorClef: {
          title: "Clave de dó na 4ª linha: a 4ª linha é C",
          body: "Na clave de dó na 4ª linha (a clave de tenor) a quarta linha, contando de baixo, é o dó central. É a mesma melodia de antes, escrita uma linha acima na pauta. Violoncelos, fagotes e trombones mudam para essa clave quando a música sobe demais para a clave de fá, evitando uma pilha de linhas suplementares.",
          caption: "Clave de dó na 4ª linha: a quarta linha é o C4.",
        },
      },
    },
    readingSightReading: {
      title: "Leitura à primeira vista",
      summary: "Leia música nova no andamento: olhe antes, não pare e leia em blocos.",
      steps: {
        scanFirst: {
          title: "Olhe antes de tocar",
          body: "Reserve alguns segundos antes da primeira nota. Confira a [[clef:clave]], a [[keySignature:armadura de clave]], a [[timeSignature:fórmula de compasso]] e a extensão das notas; depois procure padrões: compassos repetidos, escalas, arpejos e saltos. Por fim, escolha um andamento que você consiga manter até o fim, mesmo que seja mais lento do que a música pede.",
          caption: "G maior, 3/4: primeiro clave, tom e compasso, depois o desenho da melodia.",
        },
        keepGoing: {
          title: "Mantenha o pulso",
          body: "O pulso nunca para. Se errar, não volte: mantenha a batida e retome no tempo seguinte. Um andamento firme com uma nota errada soa muito melhor do que notas perfeitas que param e recomeçam. Contar em voz alta, marcar o tempo com o pé ou tocar junto com o clique ajuda a segurar o pulso.",
        },
        chunking: {
          title: "Leia em blocos",
          body: "Não leia nota por nota. Agrupe o que vê: um tempo inteiro de cada vez, ou uma forma conhecida, como uma escala, uma terça ou um arpejo. Ler os intervalos entre as notas (grau conjunto, salto, grande salto) é mais rápido do que nomear cada nota. Neste exemplo, o primeiro compasso é uma escala que sobe e desce, e o segundo é um salto de quinta.",
          caption: "Uma forma de escala e depois um salto: dois blocos.",
        },
      },
    },
  },
  explanations: {
    readingIntervalOnStaff:
      "Conte todas as linhas e espaços da nota de baixo até a de cima, incluindo as duas: {path}. São {size} notas, então o intervalo é de {interval}.",
    readingTriadName:
      "A armadura é a de {key} maior. As notas {notes}, empilhadas em terças, formam a tríade do grau {degree} dessa escala: {chord}.",
    readingRootOfTriad:
      "Uma tríade em posição fundamental empilha terças, então sua fundamental é a nota mais grave: {root}. As outras duas, {third} e {fifth}, ficam uma terça e uma quinta acima. Não esqueça a armadura de clave ao nomeá-las.",
    readingDynamic:
      "{dynamic} significa {meaning}. Do mais suave ao mais forte, as marcações são: pp, p, mp, mf, f, ff.",
    readingArticulation: "{name}: {meaning}.",
    readingTempo:
      "{bpm} BPM cai na faixa do {term} ({from}-{to} BPM). Do mais lento ao mais rápido: Largo, Adagio, Andante, Moderato, Allegro, Presto.",
    readingAltoNote:
      "Na clave de dó na 3ª linha, a linha do meio é C. Contando letra por letra dela até a sua nota, temos {path}. Então a nota é {note}.",
    readingTenorNote:
      "Na clave de dó na 4ª linha, a quarta linha é C. Contando letra por letra dela até a sua nota, temos {path}. Então a nota é {note}.",
    readingMiddleC:
      "Na {clef}, a linha inferior é {bottom}. Contando letra por letra dela até o dó central ({path}), o dó central cai aqui: {placement}.",
    readingKeyAndMeter:
      "A armadura indica: {accidentals}, que é a de {key} maior. A fórmula de compasso no início é {time}.",
    readingFirstNote:
      "Na {clef}, a primeira nota é um {letter}. A armadura ({accidentals}) não o altera, então é {note}.",
    readingFirstNoteAltered:
      "Na {clef}, a primeira nota é um {letter}. A armadura ({accidentals}) altera todo {letter} da peça, então é {note}, e não um {letter} natural.",
    readingAttackCount:
      "São {noteheads} cabeças de nota, mas a ligadura une duas delas num só som: {noteheads} menos 1 = {attacks} notas a tocar. Pausas não são tocadas.",
  },
  checkpoints: {
    readingAdvanced: {
      intervalOnStaff: "Que intervalo estas duas notas empilhadas formam? Conte as duas notas.",
      triadName: "Qual tríade está escrita na pauta?",
      rootOfTriad: "Qual é a fundamental desta tríade?",
      dynamicMeaning: "O que significa a marcação de dinâmica {dynamic}?",
      articulationName: "Qual articulação está escrita nestas notas?",
      tempoTerm: "Uma partitura indica {bpm} BPM. Que termo de andamento combina com essa velocidade?",
      nameAltoNote: "Que nota é esta na clave de dó na 3ª linha?",
      nameTenorNote: "Que nota é esta na clave de dó na 4ª linha?",
      middleCLine: "Na {clef}, onde se escreve o dó central (C4)?",
      keyAndMeter: "Supondo um tom maior, que tom e que fórmula de compasso este trecho usa?",
      firstNoteName: "Qual é a primeira nota deste trecho? Lembre-se da armadura de clave.",
      attackCount: "Quantas notas você tocaria aqui? Notas ligadas contam uma vez.",
      options: {
        interval: {
          n2: "2ª",
          n3: "3ª",
          n4: "4ª",
          n5: "5ª",
          n6: "6ª",
          n7: "7ª",
          n8: "oitava",
        },
        dynamic: {
          pp: "muito suave (pianíssimo)",
          p: "suave (piano)",
          mp: "moderadamente suave (mezzopiano)",
          mf: "moderadamente forte (mezzoforte)",
          f: "forte",
          ff: "muito forte (fortíssimo)",
        },
        articulation: {
          staccato: "Staccato",
          accent: "Acento",
          tenuto: "Tenuto",
          marcato: "Marcato",
          fermata: "Fermata",
        },
        articulationMeaning: {
          staccato: "tocar a nota curta e destacada (um ponto acima ou abaixo da cabeça da nota)",
          accent: "atacar a nota com mais força que as vizinhas (o sinal >)",
          tenuto: "sustentar a nota por todo o seu valor, com leve ênfase (um traço curto)",
          marcato: "dar à nota um acento forte e curto (o sinal ^)",
          fermata: "prolongar a nota além do escrito (um arco com um ponto)",
        },
        clef: {
          treble: "clave de sol",
          bass: "clave de fá",
          alto: "clave de dó na 3ª linha",
          tenor: "clave de dó na 4ª linha",
        },
        placement: {
          ledgerBelow: "Na 1ª linha suplementar abaixo da pauta",
          ledgerAbove: "Na 1ª linha suplementar acima da pauta",
          line2: "Na 2ª linha",
          line3: "Na 3ª linha (a do meio)",
          line4: "Na 4ª linha",
        },
        keyTime: "{key} maior, {time}",
        noAccidentals: "nenhum sustenido nem bemol",
      },
    },
  },
};
