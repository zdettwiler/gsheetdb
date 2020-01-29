import testmodel from './testmodel';

async function operations() {
  await testmodel.connect()
  testmodel.updateRow(
    { categ: 'Food' },
    { amount: 15 }
  )
  await testmodel.save()
}

operations()