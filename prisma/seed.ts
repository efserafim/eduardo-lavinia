import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.donation.deleteMany();
  await prisma.item.deleteMany();
  await prisma.photo.deleteMany();

  await prisma.item.createMany({
    data: [
      {
        name: "Jogo de panelas",
        description: "Conjunto completo para o nosso cantinho na cozinha.",
        targetAmount: 45000,
      },
      {
        name: "Air fryer",
        description: "Para refeições práticas e gostosas no dia a dia.",
        targetAmount: 55000,
      },
      {
        name: "Jogo de toalhas",
        description: "Toalhas macias para o banheiro do lar.",
        targetAmount: 18000,
      },
      {
        name: "Liquidificador",
        description: "Vitamina, molhos e muito carinho em casa.",
        targetAmount: 25000,
      },
      {
        name: "Jogo de cama",
        description: "Lençóis e edredom para noites aconchegantes.",
        targetAmount: 32000,
      },
      {
        name: "Cafeteira",
        description: "O café da manhã a dois começa por aqui.",
        targetAmount: 28000,
      },
    ],
  });

  console.log("Seed concluído: itens de exemplo criados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
