import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Tenders, TenderResponses } from '../src/db/models';

dotenv.config();

mongoose.Promise = global.Promise;

const prNumbers = [
  28244116,
  28240840,
  28363853,
  28408889,
  28433822,
  28474433,
  28474434,
  28474755,
  28493300,
  28503416,
  28531208,
  28553546,
  28559004,
  28581378,
  28582062,
  28586529,
  28612169,
  27623115,
  28626676,
  28653779,
  28653780,
  28653781,
  28653782,
  28653783,
  28653784,
  28653785,
  28653786,
  28653787,
  28653788,
  28653789,
  28653790,
  28653791,
  28653792,
  28653793,
  28653794,
  28653795,
  28653796,
  28653797,
  28653798,
  28653799,
  28653800,
  28653801,
  28653802,
  28653803,
  28653804,
  28653805,
  28653806,
  28653807,
  28653808,
  28653809,
  28653810,
  28653811,
  28653812,
  28653813,
  28653814,
  28653815,
  28653816,
  28653817,
  28653818,
  28653819,
  28653820,
  28653821,
  28653822,
  28653823,
  28653824,
  28653825,
  28653826,
  28179736,
  28362591,
  27342891,
  27531383,
  28455653,
  28515943,
  28571348,
  28591409,
  27164546,
  28040803,
  28107240,
  28218721,
  28239850,
  28175837,
  28201903,
  28218654,
  27846451,
  28150208,
  28212204,
  28255397,
  28255409,
  28307409,
  28333722,
  28345285,
  28348938,
  28348939,
  28348940,
  28348976,
  28398696,
  28415162,
  28432196,
  28433972,
  28443048,
  28443177,
  28456474,
  28466117,
  28466171,
  28466176,
  28469730,
  28475529,
  28477903,
  28480725,
  28481422,
  28481423,
  28481476,
  28481477,
  28481488,
  28481489,
  28481490,
  28481491,
  28481492,
  28481493,
  28481494,
  28481535,
  28481536,
  28481537,
  28481538,
  28481539,
  28481540,
  28481541,
  28481542,
  28481543,
  28481544,
  28481545,
  28481779,
  28482588,
  28482591,
  28482689,
  28482690,
  28482691,
  28482692,
  28482693,
  28482694,
  28482695,
  28488798,
  28488800,
  28488803,
  28488804,
  28492200,
  28498004,
  28502004,
  28503333,
  28503334,
  28507477,
  28510669,
  28510670,
  28510678,
  28511066,
  28514652,
  28515060,
  28515062,
  28515063,
  28515166,
  28515167,
  28515168,
  28515169,
  28515176,
  28515177,
  28515250,
  28515251,
  28515488,
  28525254,
  28530175,
  28530600,
  28531616,
  28531617,
  28531618,
  28536008,
  28536348,
  28543184,
  28543194,
  28543359,
  28543380,
  28544333,
  28544426,
  28547757,
  28547978,
  28548885,
  28549050,
  28549365,
  28549634,
  28549821,
  28557382,
  28557383,
  28557385,
  28558580,
  28558615,
  28558831,
  28559204,
  28562590,
  28563499,
  28565378,
  28565389,
  28565412,
  28565413,
  28571778,
  28577739,
  28580971,
  28580972,
  28580973,
  28582825,
  28591272,
  28593216,
  28593423,
  28601009,
  28607476,
  28607477,
  28607478,
  28612067,
  28617952,
  28617953,
  28617954,
  28620060,
  28620648,
  28626749,
  28631851,
  27764631,
  28391946,
  28493496,
  28538608,
  28575651,
  28419170,
  28460464,
  28483518,
  27883124,
  28181188,
  28324416,
  28348802,
  28436182,
  28068212,
  28254480,
  28510320,
  27555130,
  27961293,
  28196865,
  28276436,
  28342232,
  28395272,
  28470447,
  28475204,
  28483458,
  28483463,
  28488434,
  28493079,
  28497971,
  28502877,
  28502878,
  28502880,
  28506291,
  28508384,
  28508456,
  28510947,
  28530892,
  28535859,
  28535861,
  28558109,
  28561992,
  28563817,
  28586251,
  28586252,
  28586357,
  28590482,
  28590546,
  28600018,
  28600027,
  28611702,
  28625632,
  28646552,
  28646707,
  28506470,
  28563813,
  28439033,
  28439047,
  28439067,
  28466840,
  28466866,
  28475805,
  28417832,
  28488579,
  28400262,
  27626855,
  27800313,
  28185365,
  28314405,
  28395153,
  27947083,
  28349162,
  28483546,
  28483562,
  28568471,
  28404291,
  28483247,
  28570404,
  27685388,
  28489546,
  28489547,
  28489548,
  28510617,
  28527208,
  28531069,
  28539616,
  28539617,
  28539618,
  28539619,
  28548011,
  28553604,
  28553605,
  28553606,
  28557458,
  28565501,
  28565502,
  28577354,
  28594641,
  28612389,
  28612394,
  28612484,
  28612485,
  28612486,
  28612487,
  28612488,
  28612489,
  28612490,
  28612491,
  28612492,
  28612493,
  28612494,
  28612495,
  28612496,
  28612497,
  28612498,
  28612499,
  28612500,
  28612501,
  28612502,
  28612503,
  28612504,
  28612505,
  28612506,
  28616033,
  28616034,
  28616096,
  28616097,
  28627710,
  28627711,
  28627712,
  28627714,
  28424834,
  27913656,
  28006051,
  28149735,
  28150283,
  28585634,
  28164368,
  28311105,
  28240371,
  28432151,
  28432173,
  28483936,
  28483937,
  28483938,
  28483940,
  28483946,
  28498455,
  28498456,
  28498469,
  28503784,
  28509862,
  28514802,
  28530077,
  28553853,
  28566292,
  28566321,
  28566322,
  28593033,
  28593034,
  28593080,
  28593093,
  28593096,
  28593100,
  27674340,
  28466542,
  27963016,
  28181184,
  28502089,
  28511530,
  28525150,
  28565783,
  28635601,
  28283342,
];

module.exports.up = async next => {
  const { MONGO_URL = '' } = process.env;

  await mongoose.connect(MONGO_URL);

  // const numbers = fs.readFileSync(`${process.cwd()}/src/scripts/prNumbers.csv`).toString();

  let total = 0;
  let prCount = 0;
  let mcCount = 0;

  for (const number of prNumbers) {
    const prs = await Tenders.find({
      'requestedProducts.purchaseRequestNumber': number,
    });

    const mcs = await Tenders.find({
      'requestedProducts.code': number,
    });

    total++;

    if (prs.length > 0) {
      prCount++;
    }

    if (mcs.length > 0) {
      console.log(JSON.stringify(mcs.map(mc => mc.requestedProducts)));
      mcCount++;
    }
  }

  mongoose.connection.close();

  console.log(total, prCount, mcCount);

  throw new Error('Out');

  next();
};

module.exports.down = next => {
  next();
};
