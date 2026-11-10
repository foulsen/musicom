import type { DeepStringify } from "../deep-stringify";
import type { readingRhythmLessonsEn } from "./lessons-rhythm.en";

export const readingRhythmLessonsPt: DeepStringify<typeof readingRhythmLessonsEn> = {
  lessons: {
    readingNoteValues: {
      title: "Figuras de valor e pausas",
      summary: "Quanto dura cada nota: da semibreve à semicolcheia, e os silêncios que correspondem a elas.",
      steps: {
        figures: {
          title: "Da semibreve à semicolcheia",
          body: "Cada [[noteValue:figura de valor]] dura metade da anterior. Em 4/4, com a semínima valendo um tempo, a semibreve dura 4 tempos, a mínima 2, a semínima 1, a colcheia meio tempo e a semicolcheia um quarto de tempo. O desenho da nota diz o seu valor: cabeça vazia ou preenchida, com ou sem haste, e bandeirolas ou colchetes nas notas curtas.",
          captions: {
            whole: "Semibreve: 4 tempos",
            half: "Duas mínimas: 2 tempos cada",
            quarter: "Quatro semínimas: 1 tempo cada",
            eighth: "Oito colcheias: meio tempo cada",
            sixteenth: "Dezesseis semicolcheias: um quarto de tempo cada",
          },
        },
        rests: {
          title: "Pausas: o silêncio escrito",
          body: "A música é feita de som e de silêncio, por isso cada figura de valor tem uma pausa correspondente, com a mesma duração: a pausa de semínima dura um tempo, a de mínima dois. A pausa não interrompe o [[beat:tempo]]. O pulso continua enquanto você fica em silêncio, e a próxima nota precisa entrar na hora exata.",
          captions: {
            quarterRest: "Nota, pausa de semínima, mínima",
            halfRest: "Uma pausa de mínima e depois uma mínima",
          },
        },
        pulse: {
          title: "O pulso constante",
          body: "Por baixo de todo ritmo existe um [[beat:tempo]] constante, que você poderia marcar com o pé. As figuras só fazem sentido em relação a ele: dizem quantos tempos cada nota ocupa. Toque o exemplo e bata junto com o clique, uma batida para cada semínima.",
          captions: {
            steady: "Dois compassos de semínimas constantes",
          },
        },
      },
    },
    readingTimeSignatures: {
      title: "Compassos e fórmulas de compasso",
      summary: "Como os tempos se agrupam em compassos e como os dois números da fórmula de compasso mostram isso.",
      steps: {
        measuresAndBarlines: {
          title: "Compassos e barras",
          body: "A música é dividida em fatias iguais chamadas [[measure:compassos]], separados por barras verticais. Todo compasso tem o mesmo número de tempos, não importa quais figuras o preencham. O primeiro tempo de cada compasso recebe um acento natural, e é isso que faz você sentir os grupos.",
          captions: {
            twoMeasures: "Dois compassos com a mesma duração, preenchidos de formas diferentes",
          },
        },
        topAndBottom: {
          title: "Os dois números",
          body: "A [[timeSignature:fórmula de compasso]] tem dois números. O de cima diz quantos tempos há em cada compasso; o de baixo diz qual figura vale um tempo, e o 4 significa a semínima. Assim, 2/4 tem dois tempos de semínima, 3/4 tem três (o balanço da valsa) e 4/4 tem quatro, o mais comum de todos.",
          captions: {
            twoFour: "2/4: dois tempos por compasso",
            threeFour: "3/4: três tempos por compasso",
            fourFour: "4/4: quatro tempos por compasso",
          },
        },
        counting: {
          title: "Contando em voz alta",
          body: "Conte os tempos em voz alta, \"1 2 3 4\", e diga \"e\" para o meio tempo entre eles. As semínimas caem nos números; as colcheias preenchem os números e o \"e\" entre eles: \"1 e 2 e 3 e 4 e\". Contar é a forma mais rápida de conferir se você leu o ritmo corretamente.",
          captions: {
            countQuarters: "Contagem: 1 2 3 4",
            countEighths: "Contagem: 1 e 2 e 3 e 4 e",
          },
        },
      },
    },
    readingDotsTies: {
      title: "Pontos e ligaduras",
      summary: "Duas formas de alongar uma nota: o ponto de aumento soma metade do valor e a ligadura une duas notas.",
      steps: {
        dot: {
          title: "O ponto soma a metade",
          body: "Um ponto escrito depois da nota a alonga em metade do seu próprio valor. Uma mínima pontuada vale 2 + 1 = 3 tempos, uma semínima pontuada vale 1 + meio tempo = 1,5 tempo, e uma colcheia pontuada é uma colcheia mais uma semicolcheia. Um segundo ponto somaria metade do primeiro.",
          captions: {
            dottedHalf: "Mínima pontuada (3 tempos) e uma semínima",
            dottedQuarter: "Semínima pontuada, colcheia e mínima",
          },
        },
        tie: {
          title: "A ligadura une as notas",
          body: "A [[tie:ligadura de valor]] é uma linha curva entre duas notas de mesma altura: você toca a primeira e sustenta pela segunda sem atacá-la de novo, e as duas somam uma nota mais longa. É assim que uma nota atravessa a barra de compasso ou chega a uma duração que nenhuma figura sozinha tem. Uma curva entre alturas diferentes não é ligadura de valor, e sim de expressão, que pede para tocar as notas bem conectadas.",
          captions: {
            acrossBarline: "Uma mínima ligada através da barra de compasso",
            insideMeasure: "Uma mínima ligada a uma semínima",
          },
        },
        countingDotted: {
          title: "Contando um ritmo pontuado",
          body: "O par pontuado clássico é uma semínima pontuada seguida de uma colcheia. Conte \"1 (2) e\": a nota longa começa no 1 e dura até o meio do 2, e a nota curta cai no \"e\" do 2. A colcheia é o meio tempo que sobra e já leva direto ao tempo seguinte.",
          captions: {
            dottedQuarterEighth: "Contagem: 1 (2) e 3 4",
          },
        },
      },
    },
    readingSyncopation: {
      title: "Semicolcheias e síncope",
      summary: "Dividir o tempo em quatro, tocar entre os tempos e deslocar o acento.",
      steps: {
        sixteenths: {
          title: "Quatro notas em um tempo",
          body: "As semicolcheias dividem o tempo em quatro partes iguais. Conte \"1 i e a, 2 i e a\": o número é o tempo, o \"e\" é o meio tempo e o \"i\" e o \"a\" são as semicolcheias entre eles. Elas se escrevem com dois colchetes e costumam aparecer misturadas com colcheias dentro de um tempo.",
          captions: {
            oneEAndA: "Quatro semicolcheias e depois três semínimas",
            mixed: "Colcheias, depois semicolcheias, depois semínimas",
          },
        },
        offbeat: {
          title: "Tocando no \"e\"",
          body: "As notas que caem nos números estão no tempo; as que caem no \"e\" estão fora do tempo, no contratempo. Uma pausa no tempo seguida de uma nota no \"e\" é um padrão muito comum: você precisa sentir o tempo silencioso para colocar a nota no lugar. Marque o tempo com o pé enquanto conta o exemplo.",
          captions: {
            onTheAnd: "Pausas de colcheia nos tempos, notas em cada \"e\"",
          },
        },
        syncopation: {
          title: "Deslocando o acento",
          body: "A [[syncopation:síncope]] acontece quando uma nota começa fora do tempo e dura além do tempo seguinte, de modo que o acento vai parar onde o pulso não o espera. A figura clássica é colcheia, semínima, colcheia: a nota longa começa no \"e\" e o tempo forte passa sem um novo ataque. Mantenha o pulso firme e deixe as notas dançarem em volta dele.",
          captions: {
            shifted: "Colcheia, semínima, colcheia, semínima, semínima",
            shiftedHalf: "Colcheia, semínima, colcheia, mínima",
          },
        },
      },
    },
    readingCompoundMeter: {
      title: "Compassos compostos",
      summary: "6/8, 9/8 e 12/8: quando o tempo se divide em três e o pulso é uma figura pontuada.",
      steps: {
        simpleVsCompound: {
          title: "Dividir por dois ou por três",
          body: "Em um compasso simples como 2/4, o tempo se divide em dois: uma semínima vira duas colcheias. Em um compasso composto como 6/8, o tempo se divide em três, e as colcheias vêm em grupos de três. Os dois compassos abaixo têm o mesmo número de colcheias por grupo de tempo, mas soam bem diferentes: o primeiro marcha, o segundo balança.",
          captions: {
            simple: "2/4: quatro colcheias em dois grupos de duas",
            compound: "6/8: seis colcheias em dois grupos de três",
          },
        },
        dottedPulse: {
          title: "O pulso pontuado",
          body: "Nos compassos compostos o pulso é uma figura pontuada, que guarda exatamente três colcheias. Assim, 6/8 tem dois pulsos por compasso (contados \"1 2\"), 9/8 tem três e 12/8 tem quatro. O número de baixo ainda diz que a colcheia é a unidade, mas você sente e conta os pulsos, não as colcheias.",
          captions: {
            sixEight: "6/8: dois pulsos de semínima pontuada",
            nineEight: "9/8: três pulsos",
            twelveEight: "12/8: quatro pulsos",
          },
        },
        commonPatterns: {
          title: "Padrões comuns",
          body: "Dentro de cada pulso de três colcheias, o ritmo pode ser escrito de algumas formas: três colcheias, uma semínima mais uma colcheia (longa-curta) ou uma colcheia mais uma semínima (curta-longa), ou uma única semínima pontuada para o pulso inteiro. Aprenda a reconhecer esses desenhos de relance e você lê o compasso composto com rapidez.",
          captions: {
            quarterEighth: "Semínima mais colcheia, duas vezes",
            eighthsThenDotted: "Três colcheias e depois uma semínima pontuada",
          },
        },
      },
    },
    readingTuplets: {
      title: "Tercinas e quiálteras",
      summary: "Espremer três notas no espaço de duas, e outros grupos irregulares.",
      steps: {
        triplets: {
          title: "Três no tempo de duas",
          body: "A [[tuplet:tercina]] encaixa três notas iguais no tempo normalmente ocupado por duas da mesma espécie. Três colcheias de tercina dividem um único tempo, então cada uma dura um terço de tempo. O grupo é marcado com um pequeno 3 sobre um colchete ou sobre a barra. Conte \"1 ter-ci-na\" ou simplesmente \"1 la li\".",
          captions: {
            oneTriplet: "Um tempo de colcheias em tercina",
          },
        },
        tripletVsEighths: {
          title: "Tercina ou duas colcheias?",
          body: "Um tempo pode guardar duas colcheias ou três colcheias de tercina: mesmo tempo, divisões diferentes. Duas colcheias dão uma sensação de vai e volta; a tercina parece uma roda rolando. Preste atenção no pequeno 3 sobre as notas, ele muda completamente o ritmo.",
          captions: {
            twoThenThree: "Um tempo de colcheias e depois um tempo de tercina",
          },
        },
        otherTuplets: {
          title: "Outras quiálteras",
          body: "A tercina é a [[tuplet:quiáltera]] mais comum, mas a ideia vale para qualquer quantidade. Uma duína coloca duas notas no tempo de três e aparece em compassos compostos como o 6/8. Uma quiáltera de cinco coloca cinco notas no tempo de quatro, e uma de seis, seis no tempo de quatro. O número escrito sobre o grupo sempre diz quantas notas dividem o espaço.",
        },
      },
    },
  },
  explanations: {
    readingRhythmValueName:
      "Da mais longa à mais curta, as figuras são semibreve, mínima, semínima, colcheia e semicolcheia, cada uma com metade da duração da anterior. Esta é uma {value}.",
    readingRhythmRestName: "Uma pausa dura o mesmo que a figura de mesmo nome, então o símbolo mostrado é uma {value}.",
    readingRhythmHowManyFit:
      "Cada figura dura metade da anterior, então uma {big} tem a duração de {answer} {small}.",
    readingRhythmBeatsPerMeasure:
      "O número de cima da fórmula de compasso conta os tempos do compasso, e o 4 de baixo diz que a semínima é o tempo. Assim, {time} tem {answer} tempos.",
    readingRhythmMissingValue:
      "Um compasso {time} vale {total} colcheias. As notas mostradas ocupam {used}, então sobram {missing} colcheias, que é exatamente uma {value}.",
    readingRhythmWhichTimeSignature:
      "O número de cima é a quantidade de tempos por compasso e o de baixo é a figura que vale um tempo. {beats} tempos de {value} se escrevem {time}.",
    readingRhythmDottedValue:
      "Uma nota pontuada vale o seu valor mais a metade dele. Uma {value} são {base} {unit}, a metade disso é {half}, então a nota pontuada dura {answer} {unit}.",
    readingRhythmTiedDuration: "A ligadura soma os valores: {first} + {second} = {answer} {unit}.",
    readingRhythmAttackCount:
      "Conte só as notas que iniciam um som: {count}. Pausas não fazem som, e a segunda nota de uma ligadura apenas continua a primeira. A música tem {written} símbolos escritos.",
    readingRhythmSyncopatedYes:
      "Uma nota começa entre os tempos e dura além do tempo seguinte, então o acento sai do pulso. Isso é síncope.",
    readingRhythmSyncopatedNo:
      "Cada nota ou começa em um tempo ou termina antes de o tempo seguinte chegar, então o acento fica no pulso. Não é síncope.",
    readingRhythmCountOfNote:
      "Contando 1 e 2 e 3 e 4 e, {which} começa em {count}.",
    readingRhythmPulsesInMeter:
      "Em um compasso composto o pulso é uma figura pontuada com três colcheias. {time} tem {top} colcheias, o que dá {answer} pulsos.",
    readingRhythmSimpleMeter:
      "{time} tem {top} no número de cima, então é um compasso simples: o tempo é uma figura simples que se divide em dois.",
    readingRhythmCompoundMeter:
      "{time} tem {top} no número de cima, múltiplo de três e maior que três, então é um compasso composto: o tempo é uma figura pontuada que se divide em três.",
    readingRhythmPulseValue:
      "Em {time}, um pulso é uma {value}. O compasso tem {pulses} pulsos. Nos compassos compostos o pulso é a figura pontuada que guarda três divisões.",
    readingRhythmTripletCount:
      "Uma tercina encaixa {answer} notas iguais no tempo normalmente ocupado por {normal} da mesma espécie, então um tempo guarda {answer} colcheias de tercina.",
    readingRhythmTripletFraction:
      "Uma tercina encaixa três notas no tempo de duas normais do mesmo valor, aqui {value}. Assim, cada nota da tercina dura {answer} de um tempo.",
  },
  checkpoints: {
    readingRhythm: {
      valueName: "Qual é o valor desta nota?",
      restName: "Que pausa é esta?",
      howManyFit: "Quantas {small} cabem no tempo de uma {big}?",
      beatsPerMeasure: "Quantos tempos tem cada compasso? A semínima vale um tempo.",
      missingValue: "Qual figura única completa este compasso?",
      whichTimeSignature: "Qual fórmula de compasso tem {beats} tempos por compasso, com a {value} como tempo?",
      dottedValue: "Quantas {unit} dura uma {value} pontuada?",
      tiedDuration: "As notas ligadas soam como uma nota longa. Quanto ela dura, contado em {unit}?",
      attackCount: "Quantas notas são realmente tocadas nesta música? Notas ligadas contam uma vez.",
      attackCountRests: "Quantas notas são tocadas neste compasso? Pausas não fazem som.",
      isSyncopated: "Este ritmo é sincopado?",
      countOfNote: "Contando 1 e 2 e 3 e 4 e, em que contagem começa {which}?",
      pulsesInMeter: "Quantos pulsos tem cada compasso de {time}?",
      simpleOrCompound: "{time} é um compasso simples ou composto?",
      pulseValue: "Em {time}, qual figura vale um pulso?",
      tripletCount: "Quantas notas iguais uma tercina espreme em um tempo?",
      tripletAttackCount: "Quantas notas são tocadas neste compasso? Conte todas as notas das tercinas.",
      tripletFraction: "Com a semínima como tempo, quanto de um tempo dura cada nota desta tercina? A tercina é formada por {value}.",
      names: {
        whole: "semibreve",
        half: "mínima",
        quarter: "semínima",
        eighth: "colcheia",
        sixteenth: "semicolcheia",
        wholePlural: "semibreves",
        halfPlural: "mínimas",
        quarterPlural: "semínimas",
        eighthPlural: "colcheias",
        sixteenthPlural: "semicolcheias",
        wholeRest: "pausa de semibreve",
        halfRest: "pausa de mínima",
        quarterRest: "pausa de semínima",
        eighthRest: "pausa de colcheia",
        sixteenthRest: "pausa de semicolcheia",
        dottedQuarter: "semínima pontuada",
      },
      options: {
        whole: "Semibreve",
        half: "Mínima",
        quarter: "Semínima",
        eighth: "Colcheia",
        sixteenth: "Semicolcheia",
        wholeRest: "Pausa de semibreve",
        halfRest: "Pausa de mínima",
        quarterRest: "Pausa de semínima",
        eighthRest: "Pausa de colcheia",
        sixteenthRest: "Pausa de semicolcheia",
        dottedQuarter: "Semínima pontuada",
        yes: "Sim, é sincopado",
        no: "Não, o acento fica no tempo",
        simple: "Simples",
        compound: "Composto",
        countAnd: "{n} e",
        secondNote: "a segunda nota",
        lastNote: "a última nota",
      },
    },
  },
};
