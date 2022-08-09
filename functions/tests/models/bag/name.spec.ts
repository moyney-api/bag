import { lastValueFrom } from 'rxjs';
import { Bag } from '../../../src/models/bag';
import { MoyFirestoreMock } from 'moy-firebase-manager';
import FAKE_DB from '../../__mocks/dbs/models/name.db';
import { admin } from '../../../src/firebase';

const firestoreMock = new MoyFirestoreMock({ bags: FAKE_DB }, admin.firestore());

beforeEach(() => firestoreMock.reset());

describe('name', () => {
  const { parent_bag, child_bag } = FAKE_DB;

  it('should initialize with `New bag` as name for simple creation', async () => {
    const bag = new Bag({ userUid: 'basic_user' });

    await lastValueFrom(bag.save());

    expect(firestoreMock.get(bag.uid).name).toBe('New bag');
  });

  it('should do a simple name change', async () => {
    const bag = new Bag(parent_bag);
    const newName = 'name changed!';

    expect(bag.name).toBe(parent_bag.name);

    const nameUpdate = bag.changeName(newName).save();
    await lastValueFrom(nameUpdate);

    expect(firestoreMock.get(bag.uid).name).toBe(newName);
  });

  it('should update parent reference as well', async () => {
    const bag = new Bag(child_bag);
    const newName = 'parent should update it as well!';

    expect(bag.name).toBe(child_bag.name);
    expect(parent_bag.children![bag.uid].name).toBe(child_bag.name);

    const nameUpdate = bag.changeName(newName).save();

    await lastValueFrom(nameUpdate);

    expect(firestoreMock.get(bag.uid).name).toBe(newName);
    expect(firestoreMock.get(parent_bag.uid!).children[bag.uid].name).toBe(newName);
  });
});
