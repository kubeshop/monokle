import {useState} from 'react';

import api from './api';
import {Container, ErrorMessage, Form, List, SubmitButton} from './styles';

const Main = () => {
  const [state, setStateComponent] = useState({
    newRepo: '',
    repositories: [
      {
        name: 'facebook/react',
        owner: {
          name: 'facebook',
          avatar_url: 'https://avatars3.githubusercontent.com/u/69631?v=4',
        },
      },
    ],
    loading: false,
    error: false,
    errorMessage: '',
  });

  const handleInputChange = e => {
    setStateComponent({...state, newRepo: e.target.value});
  };

  const handleSubmit = async e => {
    e.preventDefault();

    setStateComponent({...state, loading: true, error: false});

    try {
      const {newRepo, repositories} = state;

      if (newRepo === '') throw new Error('You need to inform one repository');

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
        owner: {
          name: response.data.owner.login,
          avatar_url: response.data.owner.avatar_url,
        },
      };

      const hasRepo = repositories.find(repo => repo.name.toLowerCase() === data.name.toLowerCase());

      if (hasRepo) throw new Error('Duplicated Repository');

      setStateComponent({...state, repositories: [...repositories, data], newRepo: '', errorMessage: ''});
    } catch (Error) {
      setStateComponent({
        ...state,
        error: true,
        errorMessage: Error.message === 'Request failed with status code 404' ? 'Repository not found' : Error.message,
      });
    } finally {
      setStateComponent({...state, loading: false});
    }
  };

  const handleDelete = repo => {
    const {repositories} = state;
    setStateComponent({...state, repositories: repositories.filter(repository => repository.name !== repo.name)});
  };

  const {newRepo, loading, repositories, error, errorMessage} = state;

  return (
    <Container>
      <h1>Repositories</h1>

      <Form onSubmit={handleSubmit} error={error ? 1 : 0}>
        <input type="text" placeholder="Add Repository" value={newRepo} onChange={handleInputChange} />
        <SubmitButton loading={loading ? 1 : 0} empty={!newRepo}>
          submit
        </SubmitButton>
      </Form>

      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

      <List>
        {repositories.map(repo => (
          <li key={repo.name}>
            <div>
              <img src={repo.owner.avatar_url} alt={repo.owner.name} />
              <span>{repo.name}</span>
            </div>
            <button type="button" onClick={() => handleDelete(repo)}>
              Delete
            </button>
          </li>
        ))}
      </List>
    </Container>
  );
};

export default Main;
