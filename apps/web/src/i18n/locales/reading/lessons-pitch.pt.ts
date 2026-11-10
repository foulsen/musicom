import type { DeepStringify } from "../deep-stringify";
import type { readingPitchLessonsEn } from "./lessons-pitch.en";

export const readingPitchLessonsPt: DeepStringify<typeof readingPitchLessonsEn> = {
  lessons: {
    readingStaff: {
      title: "Lendo a pauta",
      summary: "Cinco linhas, quatro espaços e uma clave: como a altura é escrita no papel.",
      steps: {
        staffLines: {
          title: "Cinco linhas, quatro espaços",
          body: "A música é escrita na [[staff:pauta]]: cinco linhas horizontais e os quatro espaços entre elas. Linhas e espaços são contados de baixo para cima, e cada um representa uma nota diferente. Quanto mais alto a nota está na pauta, mais agudo ela soa. Aqui estão primeiro as cinco linhas e depois os quatro espaços.",
          captions: {
            lines: "As cinco linhas da pauta em clave de sol: E4, G4, B4, D5 e F5, contadas de baixo para cima.",
            spaces: "Os quatro espaços da pauta em clave de sol: F4, A4, C5 e E5, contados de baixo para cima.",
          },
        },
        trebleClef: {
          title: "A clave de sol",
          body: "O símbolo no início da pauta é uma [[clef:clave]], e ele diz qual nota cada linha e espaço representa. A clave de sol (G) se enrola em volta da segunda linha, que é o G4. A partir daí tudo se encaixa: a linha de baixo é o E4 e a de cima é o F5, então a pauta vai de E4 a F5.",
          captions: {
            notes: "E4 na primeira linha, G4 na segunda linha (onde a clave se enrola) e F5 na quinta linha.",
          },
        },
        landmarks: {
          title: "Leia por graus a partir do G",
          body: "Você não precisa decorar as nove posições de uma vez. Parta de um ponto de referência, como o G da segunda linha, e ande uma posição por vez: linha, espaço, linha, espaço. Cada passo para cima é a próxima letra do alfabeto musical (A B C D E F G, e depois A de novo). Toque as notas enquanto acompanha.",
          captions: {
            climb: "Subindo a partir do G4, uma posição por vez: G, A, B, C, D, E, F.",
          },
        },
      },
    },
    readingLedgerLines: {
      title: "Linhas suplementares e o dó central",
      summary: "O que fazer quando uma nota é aguda ou grave demais para a pauta.",
      steps: {
        ledgerLines: {
          title: "Além da pauta",
          body: "Quando uma nota é aguda ou grave demais para as cinco linhas, a pauta ganha pequenas [[ledgerLine:linhas suplementares]]. Elas continuam o padrão de linhas e espaços: a primeira acima da pauta em clave de sol guarda o A5 e a primeira abaixo guarda o C4. Notas logo fora da pauta, como G5 ou D4, ficam penduradas no espaço e não precisam de linha suplementar.",
          captions: {
            outside: "Acima da pauta: F5, G5 e A5 (na primeira linha suplementar). Abaixo: E4, D4 e C4 (na primeira linha suplementar).",
          },
        },
        middleC: {
          title: "O dó central",
          body: "O C4, perto do meio do teclado do piano, é chamado de dó central. Na pauta em clave de sol ele fica na primeira linha suplementar abaixo da pauta. Conte a partir dele: o D4 fica pendurado sob a primeira linha e o E4 é a própria primeira linha.",
          captions: {
            middleC: "O dó central (C4) na sua linha suplementar, depois D4 e E4 subindo de volta para a pauta.",
          },
        },
        octaves: {
          title: "Mesma letra, outra oitava",
          body: "A mesma letra aparece várias vezes em alturas diferentes, cada uma a uma [[octave:oitava]] da outra. Um número as distingue: o dó central é o C4 e o próximo C acima é o C5. O número sobe sempre que passamos por um C, então o B3 fica logo abaixo do C4 e o B4 logo abaixo do C5.",
          captions: {
            octaves: "C4 e C5, depois G4 e G5: a mesma letra, a uma oitava de distância.",
          },
        },
      },
    },
    readingBassClef: {
      title: "A clave de fá e a pauta dupla",
      summary: "A clave de fá para as notas graves e como a clave de sol e a de fá se juntam.",
      steps: {
        fClef: {
          title: "A clave de fá",
          body: "As notas graves são escritas com a [[clef:clave]] de fá. Seus dois pontos ficam em volta da quarta linha, que é o F3. A linha de baixo é o G2 e a de cima é o A3, então as mesmas linhas e espaços significam notas diferentes das da clave de sol.",
          captions: {
            climb: "Subindo pela pauta em clave de fá a partir da linha de baixo: G2, A2, B2, C3, D3, E3, F3, G3.",
          },
        },
        grandStaff: {
          title: "A pauta dupla",
          body: "A música de piano junta uma pauta em clave de sol e outra em clave de fá. O dó central fica entre elas: uma linha suplementar abaixo da pauta de sol ou uma linha suplementar acima da pauta de fá. É o mesmo som escrito de duas maneiras. Repare como a mesma posição vira uma nota diferente em cada clave.",
          captions: {
            treble: "O dó central escrito abaixo da pauta em clave de sol.",
            bass: "O dó central escrito acima da pauta em clave de fá.",
          },
        },
        bassLandmarks: {
          title: "Pontos de referência no grave",
          body: "Use pontos de referência aqui também: o F3 na linha entre os dois pontos, o C3 no segundo espaço e o dó central acima da pauta. A partir de qualquer um deles, conte para cima ou para baixo uma letra por vez, exatamente como na clave de sol.",
          captions: {
            landmarks: "Pontos de referência na clave de fá: F3, C3 e o dó central (C4).",
          },
        },
      },
    },
    readingAccidentals: {
      title: "Sustenidos, bemóis e bequadros",
      summary: "Os sinais que sobem ou descem uma nota e por quanto tempo valem.",
      steps: {
        symbols: {
          title: "Os sinais",
          body: "Um [[accidental:acidente]] é um sinal escrito antes de uma nota. O sustenido (#) a sobe um [[semitone:semitom]], o bemol (b) a desce um semitom e o bequadro cancela um sustenido ou bemol anterior. O dobrado sustenido sobe a nota dois semitons e o dobrado bemol a desce dois. O sinal vai à esquerda da nota, na mesma linha ou espaço.",
          captions: {
            signs: "F sustenido, depois F bequadro (cancelando o sustenido), B bemol e G dobrado sustenido.",
          },
        },
        measureRule: {
          title: "Por quanto tempo valem",
          body: "Um acidente vale para todas as notas seguintes na mesma linha ou espaço até a barra do [[measure:compasso]]. Ele não passa para outras oitavas, e o compasso seguinte começa limpo. No exemplo, o segundo F# não precisa de sinal, mas o F uma oitava acima é F natural. Toque e escute.",
          captions: {
            rule: "O segundo F# não precisa de sinal; o F uma oitava acima e o F do compasso seguinte são naturais.",
          },
        },
        enharmonicSpelling: {
          title: "Mesmo som, outra grafia",
          body: "F# e Gb são duas maneiras de escrever a mesma tecla, um par [[enharmonic:enarmônico]]. Na pauta eles ficam em posições diferentes: o F# na posição do F, o Gb na posição do G. A grafia diz a letra mesmo quando o som é o mesmo, e a tonalidade decide qual usar. Toque os dois e compare.",
          captions: {
            pair: "F sustenido e G bemol: posições diferentes na pauta, o mesmo som.",
          },
        },
      },
    },
    readingKeySignatures: {
      title: "Armaduras de clave",
      summary: "Os sustenidos e bemóis depois da clave que definem a tonalidade.",
      steps: {
        whatIsKeySignature: {
          title: "O que é a armadura de clave",
          body: "Em vez de escrever um sustenido antes de cada F, a música coloca os sustenidos ou bemóis logo depois da [[clef:clave]], uma vez só. Essa é a [[keySignature:armadura de clave]], e ela vale para todas as notas daquela letra, em todas as oitavas, durante a peça inteira, a menos que um acidente a altere. No exemplo, um sustenido na linha do F significa que todo F é F#.",
          captions: {
            gMajor: "G maior: um sustenido na armadura, então o F do segundo compasso soa F#.",
          },
        },
        orderOfAccidentals: {
          title: "A ordem dos acidentes",
          body: "Sustenidos e bemóis aparecem sempre na mesma ordem. Sustenidos: F C G D A E B. Bemóis: B E A D G C F, exatamente o inverso. Uma armadura com três sustenidos é sempre F#, C# e G#, nunca outros três. Essa ordem fixa é o que permite ler a tonalidade de relance.",
          captions: {
            sharps: "Os sete sustenidos, em ordem: F, C, G, D, A, E, B.",
            flats: "Os sete bemóis, em ordem: B, E, A, D, G, C, F.",
          },
        },
        findTheKey: {
          title: "Descobrindo a tonalidade",
          body: "Com sustenidos, pegue o último sustenido e suba um semitom: o último de três sustenidos é o G#, então a tonalidade é A maior. Com bemóis, a tonalidade é o penúltimo bemol: com três bemóis (Bb, Eb, Ab) é E bemol maior. Um bemol é a exceção: F maior. A relativa menor começa 3 semitons abaixo da tônica maior.",
          captions: {
            sharps: "Três sustenidos: o último é G#, um semitom acima é A, então A maior (F# menor é a relativa).",
            flats: "Três bemóis: o penúltimo é Eb, então E bemol maior (C menor é a relativa).",
          },
        },
      },
    },
  },
  explanations: {
    readingNameNote: "Contando letra por letra a partir da linha de baixo ({bottom}): {path}. Então esta nota é {note}.",
    readingOnLine: "{note} está na linha {number}, contando as linhas de baixo para cima.",
    readingInSpace: "{note} está no espaço {number}, contando os espaços de baixo para cima.",
    readingStep: "{a} e {b} são vizinhas no alfabeto musical, então uma está numa linha e a outra no espaço ao lado: isso é um grau conjunto (passo).",
    readingSkip: "De {a} a {b} você pula {between}: as duas notas estão em linhas ou as duas em espaços. Isso é um salto de terça.",
    readingLeap: "De {a} a {b} você pula {skipped} notas ({between}): isso é um salto grande, maior que uma terça.",
    readingNameLedger: "Parta da linha na borda da pauta ({edge}) e continue contando letra por letra: {path}. Essa nota é {note}.",
    readingLedgerCount: "{note} fica {side} da pauta, e chegar até ela exige {count} linha suplementar. | {note} fica {side} da pauta, e chegar até ela exige {count} linhas suplementares.",
    readingLedgerNone: "{note} fica {side} da pauta, no espaço logo ao lado dela, então não precisa de linha suplementar.",
    readingOctave: "O número da oitava sobe a cada C, e a pauta em clave de sol começa no E4 (linha de baixo). Lendo este {letter}, a nota é {note}.",
    readingSameSpot: "Na clave de sol esta posição é {treble}; na clave de fá a mesma posição é {bass}. A linha de baixo é {trebleBottom} na clave de sol, mas {bassBottom} na clave de fá.",
    readingSharpNote: "A nota está na posição do {letter}, e o sustenido a sobe um semitom: {note}.",
    readingFlatNote: "A nota está na posição do {letter}, e o bemol a desce um semitom: {note}.",
    readingMeasureRuleSame: "O {first} escrito antes no compasso continua valendo para o {letter} na mesma linha ou espaço até a barra. Soa {note}.",
    readingMeasureRuleNext: "A barra de compasso cancela o {first} do compasso anterior, então o {letter} volta à armadura de clave. Soa {note}.",
    readingEnharmonic: "{shown} e {answer} são a mesma tecla escrita de duas maneiras: {shown} fica na posição do {shownLetter} e {answer} na posição do {answerLetter}, mas soam iguais.",
    readingMajorKeyNone: "Sem sustenidos nem bemóis é C maior (ou A menor).",
    readingMajorKeySharps: "Com {count} sustenido, o último é {last}. A tonalidade maior fica um semitom acima do último sustenido: {tonic} maior. | Com {count} sustenidos, o último é {last}. A tonalidade maior fica um semitom acima do último sustenido: {tonic} maior.",
    readingMajorKeyOneFlat: "Um único bemol (Bb) é a exceção à regra dos bemóis: é F maior.",
    readingMajorKeyFlats: "Com {count} bemóis ({list}), o penúltimo bemol dá o nome da tonalidade: {tonic} maior.",
    readingMinorKey: "Esta armadura pertence a {major} maior e à sua relativa menor. A tônica menor fica 3 semitons abaixo da maior: {minor} menor.",
    readingCountSharps: "{key} maior tem {count} sustenido: {list}. | {key} maior tem {count} sustenidos: {list}.",
    readingCountFlats: "{key} maior tem {count} bemol: {list}. | {key} maior tem {count} bemóis: {list}.",
    readingNoteInKey: "A armadura de clave ({list}) vale para todo {letter}, então a nota sem sinal soa {note}.",
  },
  checkpoints: {
    readingPitch: {
      nameNote: "Qual nota está escrita na pauta?",
      lineOrSpace: "Onde esta nota está? Conte as linhas e os espaços de baixo para cima.",
      stepOrSkip: "Como estas duas notas se movem?",
      nameLedgerNote: "Qual nota está escrita? Ela fica fora da pauta.",
      countLedgerLines: "Quantas linhas suplementares esta nota precisa?",
      whichOctave: "Qual nota está escrita, com o número da oitava?",
      nameBassNote: "Qual nota está escrita na clave de fá?",
      nameBassLedgerNote: "Qual nota da clave de fá está escrita? Ela fica fora da pauta.",
      sameNoteOtherClef: "Imagine esta mesma posição com clave de fá no lugar da clave de sol. Qual seria a nota?",
      nameAccidentalNote: "Qual nota está escrita, com o acidente?",
      measureRuleSame: "A segunda nota não tem acidente próprio. Qual nota soa?",
      measureRuleNext: "A segunda nota está no compasso seguinte e não tem acidente. Qual nota soa?",
      enharmonicOnStaff: "Qual nota soa exatamente igual à que está escrita?",
      majorKeyOfSignature: "Qual tonalidade maior tem esta armadura de clave?",
      minorKeyOfSignature: "Qual tonalidade menor tem esta armadura de clave?",
      accidentalCount: "Quantos sustenidos ou bemóis tem a tonalidade de {key} maior?",
      noteInKey: "Seguindo a armadura de clave, qual nota soa?",
      options: {
        line: "Linha {n}",
        space: "Espaço {n}",
        step: "Grau conjunto",
        skip: "Salto de terça",
        leap: "Salto maior",
        majorKey: "{note} maior",
        minorKey: "{note} menor",
      },
      sides: {
        below: "abaixo",
        above: "acima",
      },
    },
  },
};
