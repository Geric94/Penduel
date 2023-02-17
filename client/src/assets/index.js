// backgrounds
import sister from './background/sister.jpg';
import letters1 from './background/letters1.png';
import letters2 from './background/letters2.png';
import penduel from './background/penduel.gif';

// cards
import ace from './Ace.png';
import bakezori from './Bakezori.png';
import blackSolus from './Black_Solus.png';
import calligrapher from './Calligrapher.png';
import chakriAvatar from './Chakri_Avatar.png';
import coalfist from './Coalfist.png';
import desolator from './Desolator.png';
import duskRigger from './Dusk_Rigger.png';
import flamewreath from './Flamewreath.png';
import furiosa from './Furiosa.png';
import geomancer from './Geomancer.png';
import goreHorn from './Gore_Horn.png';
import heartseeker from './Heartseeker.png';
import jadeMonk from './Jade_Monk.png';
import kaidoExpert from './Kaido_Expert.png';
import katara from './Katara.png';
import kiBeholder from './Ki_Beholder.png';
import kindling from './Kindling.png';
import lanternFox from './Lantern_Fox.png';
import mizuchi from './Mizuchi.png';
import orizuru from './Orizuru.png';
import scarletViper from './Scarlet_Viper.png';
import stormKage from './Storm_Kage.png';
import suzumebachi from './Suzumebachi.png';
import tuskBoar from './Tusk_Boar.png';
import twilightFox from './Twilight_Fox.png';
import voidTalon from './Void_Talon.png';
import whiplash from './Whiplash.png';
import widowmaker from './Widowmaker.png';
import xho from './Xho.png';
import man from './man.png';

// logos
import logo from './logo.svg';
import alyra from './alyra.png';

// icon
import attack from './attack.png';
import defense from './defense.png';
import alertIcon from './alertIcon.svg';
import AlertIcon from './AlertIcon.jsx';

// players
import AlyraRedIcon from './AlyraRedIcon.png';
import AlyraGreenIcon from './AlyraGreenIcon.png';

// sounds
import attackSound from './sounds/attack.wav';
import defenseSound from './sounds/defense.mp3';
import explosion from './sounds/explosion.mp3';

export const allCards = [
  ace,
  bakezori,
  blackSolus,
  calligrapher,
  chakriAvatar,
  coalfist,
  desolator,
  duskRigger,
  flamewreath,
  furiosa,
  geomancer,
  goreHorn,
  heartseeker,
  jadeMonk,
  kaidoExpert,
  katara,
  kiBeholder,
  kindling,
  lanternFox,
  mizuchi,
  orizuru,
  scarletViper,
  stormKage,
  suzumebachi,
  tuskBoar,
  twilightFox,
  voidTalon,
  whiplash,
  widowmaker,
  xho,
  man,
];

export {
  sister,
  letters1,
  letters2,
  penduel,

  ace,
  bakezori,
  blackSolus,
  calligrapher,
  chakriAvatar,
  coalfist,
  desolator,
  duskRigger,
  flamewreath,
  furiosa,
  geomancer,
  goreHorn,
  heartseeker,
  jadeMonk,
  kaidoExpert,
  katara,
  kiBeholder,
  kindling,
  lanternFox,
  mizuchi,
  orizuru,
  scarletViper,
  stormKage,
  suzumebachi,
  tuskBoar,
  twilightFox,
  voidTalon,
  whiplash,
  widowmaker,
  xho,
  man,

  logo,
  alyra,

  attack,
  defense,
  alertIcon,
  AlertIcon,

  AlyraRedIcon,
  AlyraGreenIcon,

  attackSound,
  defenseSound,
  explosion,
};

export const battlegrounds = [
  { id: 'bg-sister', image: sister, name: 'Sister' },
  { id: 'bg-letters1', image: letters1, name: 'Letters1' },
  { id: 'bg-letters2', image: letters2, name: 'Letters2' },
  { id: 'bg-penduel', image: penduel, name: 'Penduel' },
];

export const gameRules = [
  'Use the alphabet below to guess the word, or click hint to get a clue.',
  'Card with the same defense and attack point will cancel each other out.',
  'Attack points from the attacking card will deduct the opposing player’s health points.',
  'If P1 does not defend, their health wil be deducted by P2’s attack.',
  'If P1 defends, P2’s attack is equal to P2’s attack - P1’s defense.',
  'If a player defends, they refill 3 Mana',
  'If a player attacks, they spend 3 Mana',
];