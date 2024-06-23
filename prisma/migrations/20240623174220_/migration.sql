-- CreateTable
CREATE TABLE "measurements" (
    "id" SERIAL NOT NULL,
    "deviceId" VARCHAR(255) NOT NULL,
    "activeEnergy" DOUBLE PRECISION NOT NULL,
    "activePower" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);
