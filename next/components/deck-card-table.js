import { useContext } from 'react';
import PropTypes from 'prop-types';
import { ThemeContext } from './theme-context';
import { FACTION_COLORS } from '../constants/factions';
import DeckCardsTableRow from './deck-card-table-row';
import DeckCardsTableEditMeta from './deck-card-table-edit-meta';
import EditDeckName from './edit-deck-name';
import DeckBuilderUser from './deck-builder-user';

export default function DeckCardsTable({
  deck,
  deleteCard,
  onlyTable,
  switchToCards,
  setTab,
  updateDeckName
}) {
  const deckCards = deck && Object.values(deck.mainDeck);
  const colspan = deleteCard ? 4 : 3;
  const theme = useContext(ThemeContext);

  /**
   * Returns a score that can be used to sort cards by faction. Note that
   * this score should only be used to compare cards with the same number
   * of factions.
   */
  const factionSortScore = card => {
    const colorOrder = {
      [FACTION_COLORS.blue]: 32,
      [FACTION_COLORS.yellow]: 16,
      [FACTION_COLORS.red]: 8,
      [FACTION_COLORS.green]: 4,
      [FACTION_COLORS.orange]: 2,
      [FACTION_COLORS.purple]: 1
    };
    const factionNames = card.cardFactions.nodes
      .filter(Boolean)
      .map(n => n.faction.name.toLowerCase());
    return Object.keys(colorOrder).reduce((acc, curr) => {
      if (factionNames.indexOf(curr) === -1) {
        return acc;
      }
      return acc + colorOrder[curr];
    }, 0);
  };

  const sortCards = (a, b) => {
    const aCard = a.card;
    const bCard = b.card;

    // Cards with one faction come before cards with multiple factions
    const aCardFactions = aCard.cardFactions.nodes.filter(Boolean);
    const bCardFactions = bCard.cardFactions.nodes.filter(Boolean);
    if (aCardFactions.length !== bCardFactions.length) {
      return aCardFactions.length - bCardFactions.length;
    }

    // Next, cards are sorted by faction
    // Single: Blue, Yellow, Red, Green, Orange, Purple
    // Multi: BY, BR, BG, BO, BP, YR, YG, YO, YP, RG, RO, RP, GO, GP, OP
    // Cards that receive the higher score should come first
    const aCardScore = factionSortScore(aCard);
    const bCardScore = factionSortScore(bCard);
    if (aCardScore !== bCardScore) {
      return bCardScore - aCardScore;
    }

    // Within color, sort by mana cost
    if (aCard.mana !== bCard.mana) {
      return aCard.mana - bCard.mana;
    }

    // Lastly, sort alphabetically
    const aName = aCard.name.toLowerCase();
    const bName = bCard.name.toLowerCase();
    if (aName < bName) return -1;
    if (aName > bName) return 1;
    return 0;
  };

  const sortedCards = deckCards.sort(sortCards);

  return (
    <div className="deck-card-table-container">
      <style jsx>{`
        .deck-card-table-container {
          margin-top: 10px;
          padding: 10px;
        }
        .deck-card-table {
          border-collapse: collapse;
          width: 100%;
        }
        .deck-author {
          margin: 10px 0;
        }
        td {
          padding: 6px;
          border: ${theme.cardTableBorder};
        }
      `}</style>
      {!onlyTable && (
        <EditDeckName deckName={deck.deckName} onChange={updateDeckName} />
      )}
      {!onlyTable && <DeckBuilderUser />}
      <table className="deck-card-table" data-cy="deckCardTable">
        <tbody>
          <tr>
            <td colSpan={2}>Path</td>
            <td colSpan={colspan}>
              <DeckCardsTableEditMeta
                metaName="path"
                showEdit={!onlyTable}
                metaValue={deck.deckPath && deck.deckPath.name}
                onEditClick={() => {
                  setTab('Paths');
                  switchToCards();
                }}
              />
            </td>
          </tr>
          <tr>
            <td colSpan={2}>Power</td>
            <td colSpan={colspan}>
              <DeckCardsTableEditMeta
                metaName="power"
                showEdit={!onlyTable}
                metaValue={deck.deckPower && deck.deckPower.name}
                onEditClick={() => {
                  setTab('Powers');
                  switchToCards();
                }}
              />
            </td>
          </tr>
          {sortedCards.map((deckCard, i) => (
            <DeckCardsTableRow
              key={i}
              card={deckCard.card}
              quantity={deckCard.quantity}
              deleteCard={deleteCard}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

DeckCardsTable.propTypes = {
  onlyTable: PropTypes.bool,
  deleteCard: PropTypes.func,
  deck: PropTypes.shape({
    deckName: PropTypes.string,
    deckPath: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string
    }),
    deckPower: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string
    }),
    deckCoverArt: PropTypes.string,
    mainDeck: PropTypes.shape({
      quantity: PropTypes.number,
      card: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        mana: PropTypes.number,
        gem: PropTypes.number,
        supertype: PropTypes.string,
        rarity: PropTypes.string
      })
    }),
    errors: PropTypes.arrayOf(PropTypes.string),
    switchToCards: PropTypes.func,
    setTab: PropTypes.func
  }),
  updateDeckName: PropTypes.func,
  switchToCards: PropTypes.func,
  setTab: PropTypes.func
};
