import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import ErrorMessage from './error-message';
import DeckList from './deck-list';

export const decksSearchQuery = gql`
  query decks($name: String!) {
    searchDecks(name: $name) {
      nodes {
        id
        name
      }
    }
  }
`;

class AllDecks extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Query query={decksSearchQuery} variables={this.props.search}>
        {({ loading, error, data: { searchDecks } }) => {
          if (error) return <ErrorMessage message="Error loading decks." />;
          if (loading) return <div>Loading</div>;

          return <DeckList decks={searchDecks.nodes} />;
        }}
      </Query>
    );
  }
}

export default AllDecks;
