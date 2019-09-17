import React, { Component } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  StarredButton,
  OwnerAvatar,
  Info,
  Title,
  Author,
  ShimmerText,
  ShimmerBio,
  ShimmerAvatar,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    visible: false,
    refreshing: false,
    page: 1,
  };

  async componentDidMount() {
    this.load();
  }

  load = async (page = 1) => {
    const { navigation } = this.props;
    const { stars } = this.state;
    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`, {
      params: { page },
    });

    this.setState({
      stars: page >= 2 ? [...stars, ...response.data] : response.data,
      page,
      visible: true,
      refreshing: false,
    });
  };

  loadMore = () => {
    const { page } = this.state;

    const next = page + 1;

    this.load(next);
  };

  refreshList = () => {
    this.setState({ refreshing: true, stars: [] }, this.load);
  };

  handleNavigate = repository => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repository });
  };

  render() {
    const { navigation } = this.props;
    const { stars, visible, refreshing } = this.state;

    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <ShimmerAvatar autoRun visible={visible}>
            <Avatar source={{ uri: user.avatar }} />
          </ShimmerAvatar>
          <ShimmerText autoRun visible={visible}>
            <Name>{user.name}</Name>
          </ShimmerText>
          <ShimmerBio autoRun visible={visible}>
            <Bio>{user.bio}</Bio>
          </ShimmerBio>
        </Header>

        <Stars
          data={stars}
          onRefresh={this.refreshList}
          refreshing={refreshing}
          onEndReachedThreshold={0.2}
          onEndReached={this.loadMore}
          keyExtractor={star => String(star.id)}
          renderItem={({ item }) => (
            <StarredButton
              onPress={() => {
                this.handleNavigate(item);
              }}
            >
              <Starred>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            </StarredButton>
          )}
        />
      </Container>
    );
  }
}
