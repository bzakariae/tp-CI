import { describe, it, beforeEach, expect, vi } from 'vitest';
import { PokemonService } from './PokemonService';
import { PokeApiClient } from '~/services/PokeApiClient';
import { Pokemon } from '~/services/pokemon';

vi.mock('~/services/PokeApiClient'); // Mock du client

describe('PokemonService', () => {
  let service: PokemonService;
  let mockPokeApiClient: PokeApiClient;

  beforeEach(() => {
    // Mock du client PokeApiClient
    mockPokeApiClient = {
      getPokemonList: vi.fn(),
    } as unknown as PokeApiClient;

    service = new PokemonService(mockPokeApiClient);
  });

  describe('getPokemonList', () => {
    it('should return a list of pokemons from PokeApiClient', async () => {
      const mockPokemonList: Pokemon[] = [
        { id: 1, name: 'Bulbasaur', type: 'Grass' },
        { id: 2, name: 'Charmander', type: 'Fire' },
      ];
      (mockPokeApiClient.getPokemonList as vi.Mock).mockResolvedValue(mockPokemonList);

      const result = await service.getPokemonList();

      expect(result).toEqual(mockPokemonList);
      expect(mockPokeApiClient.getPokemonList).toHaveBeenCalledOnce();
    });
  });

  describe('getUserTeam', () => {
    it('should return an empty team if the user has no team', () => {
      const userId = 'user1';

      const team = service.getUserTeam(userId);

      expect(team).toEqual([]);
    });

    it('should return the user\'s team if it exists', () => {
      const userId = 'user1';
      const mockTeam: Pokemon[] = [
        { id: 1, name: 'Bulbasaur', type: 'Grass' },
      ];
      service['userTeams'].set(userId, mockTeam);

      const team = service.getUserTeam(userId);

      expect(team).toEqual(mockTeam);
    });
  });

  describe('clearTeam', () => {
    it('should remove the user\'s team', () => {
      const userId = 'user1';
      service['userTeams'].set(userId, [{ id: 1, name: 'Bulbasaur', type: 'Grass' }]);

      service.clearTeam(userId);

      expect(service.getUserTeam(userId)).toEqual([]);
    });
  });

  describe('togglePokemonInTeam', () => {
    it('should add a pokemon to the user\'s team if not already present', () => {
      const userId = 'user1';
      const pokemon: Pokemon = { id: 1, name: 'Bulbasaur', type: 'Grass' };

      const result = service.togglePokemonInTeam(userId, pokemon);

      expect(result).toBe(true);
      expect(service.getUserTeam(userId)).toContainEqual(pokemon);
    });

    it('should remove a pokemon from the user\'s team if already present', () => {
      const userId = 'user1';
      const pokemon: Pokemon = { id: 1, name: 'Bulbasaur', type: 'Grass' };
      service['userTeams'].set(userId, [pokemon]);

      const result = service.togglePokemonInTeam(userId, pokemon);

      expect(result).toBe(true);
      expect(service.getUserTeam(userId)).not.toContainEqual(pokemon);
    });

    it('should not add a pokemon if the team already has 6 pokemons', () => {
      const userId = 'user1';
      const mockTeam: Pokemon[] = [
        { id: 1, name: 'Bulbasaur', type: 'Grass' },
        { id: 2, name: 'Charmander', type: 'Fire' },
        { id: 3, name: 'Squirtle', type: 'Water' },
        { id: 4, name: 'Pidgey', type: 'Flying' },
        { id: 5, name: 'Rattata', type: 'Normal' },
        { id: 6, name: 'Jigglypuff', type: 'Fairy' },
      ];
      service['userTeams'].set(userId, mockTeam);

      const newPokemon: Pokemon = { id: 7, name: 'Snorlax', type: 'Normal' };

      const result = service.togglePokemonInTeam(userId, newPokemon);

      expect(result).toBe(false);
      expect(service.getUserTeam(userId)).not.toContainEqual(newPokemon);
    });
  });
});
