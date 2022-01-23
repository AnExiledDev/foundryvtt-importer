import { actorToFifth, featureCollectionToItems } from './actors.convert';
import { textToActor } from './actors.process';
import { UserData } from './importForm';

async function txtRoute(stringData: string) {
  const actor = textToActor(stringData);
  const { actions, features, reactions, allFeatures } = actor;
  const preparedItems = featureCollectionToItems(
    allFeatures,
    { actions, features, reactions },
    { abilities: actor.stats },
  );
  console.log(`Prepared items: ${JSON.stringify(preparedItems, null, 2)}`);
  const foundryActor = await Actor.create({
    name: actor.name,
    type: 'npc',
    data: actorToFifth(actor),
  });

  await Promise.all(
    preparedItems.map(async (item) => {
      console.log(`Creating item: ${item.name}`);
      return await Item.create(
        {
          ...item,
        },
        {
          parent: foundryActor,
        },
      );
    }),
  );
}

export async function processActorInput({ jsonfile, clipboardInput }: UserData) {
  if (clipboardInput) {
    console.log(`Clipboard input: ${clipboardInput}`);
    txtRoute(clipboardInput);
    return;
  }
  const response = await fetch(jsonfile);
  if (!response.ok) {
    console.log(`Error reading ${jsonfile}`);
    return;
  }
  const data = await response.text();
  console.log(`Data: ${data}`);

  const ext = jsonfile.split('.').pop();
  switch (ext) {
    default:
      console.log(`Unknown file type ${ext}`);
  }
}
