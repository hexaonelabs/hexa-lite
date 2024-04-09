import { database } from "@/firebase-config";
import { push, ref, get as getFirebaseData } from "firebase/database";
import type { Route } from "@lifi/sdk";
import { toChecksumAddress, isValidAddress } from 'ethereumjs-util';

const countPoints = (actionType: 'liquid-staking'|string) => (actionType === 'liquid-staking') ? 1000 : 100

const isValidEVMAddress = (address: string) => {
  // Check if it has the basic requirements of an address
  if (!isValidAddress(address)) {
    return false;
  }
  // If it's a checksum address, check the checksum
  if (address.match(/([A-F].*)/)) {
    return address === toChecksumAddress(address);
  }
  // Otherwise, return true
  return true;
}

type PointRoute = Route;

export type PointsData = {
  route: PointRoute;
  actionType: string;
};

export type ResponseAPIGetAddressPointsSuccess = {
  message: string;
  data: {
    address: string | string[];
    routes: {
      route: PointRoute;
      actionType: string;
    }[];
    totalPoints: string;
  };
};

export const getLeaderboardDatas = async () => {
  try {
    const snapshot = await getFirebaseData(ref(database, "points"));
    const routesResponse = snapshot.val() as {
      [address: string]: {
        [key: string]: { route: PointRoute; actionType: string };
      };
    };
    // foreach `address` in `routesResponse` object
    const addresses =
      routesResponse &&
      Object.keys(routesResponse).map((address) => {
        const routes = Object.keys(routesResponse[address]).map(
          (key) => routesResponse[address][key]
        );
        const totalPoints = routes
          .reduce(
            (acc: number, { route, actionType }) =>
              acc +
              (Number(route.toAmountUSD) * countPoints(actionType)) / 3.618 / routes.length,
            0
          ).toFixed(0) || "0";
        // shortned address
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
        return {
          address: shortAddress,
          totalPoints,
        };
      });
    return {
      message: "leaderboard address fetched successfully👍",
      data: addresses
        .sort((a, b) => Number(b.totalPoints) - Number(a.totalPoints))
        .slice(0, 10),
    };
  } catch (error: unknown) {
    return {
      message: "Address points fetched failed👎",
      error: error instanceof Error ? error.message : error,
    };
  }
}

export const getAddressPoints = async (address: string) => {
  if (address !== "leaderboard" && !isValidEVMAddress(address as string)) {
    return {
      message: "Invalid address",
    };
  }
  try {
    // Create a reference to the user's points in the Firebase database
    const addressPointsRef = ref(database, `points/${address.toLocaleLowerCase()}`);
    // Get the existing tasks from the database
    const snapshot = await getFirebaseData(addressPointsRef);
    if (!snapshot.exists()) {
      return {
        message: "Address points fetched successfully👍",
        data: {
          address,
          routes: [],
          totalPoints: "0",
        },
      };
    }
    const routesResponse = snapshot.val() as {
      [key: string]: { route: PointRoute; actionType: string };
    };
    // convert as Array
    const routes = Object.keys(routesResponse).map(
      (key) => routesResponse[key]
    );
    const totalPoints =
      routes
        .reduce(
          (acc: number, { route, actionType }) =>
            acc + (Number(route.toAmountUSD) * countPoints(actionType)) / 3.618 / routes.length,
          0
        )
        .toFixed(0) || "0";
    return {
      message: "Address points fetched successfully👍",
      data: {
        address,
        routes: routes.map(({ actionType, route: {toAmountUSD} }) => ({ actionType, points: (Number(toAmountUSD) * 100) / 3.618 })),
        totalPoints,
      },
    };
  } catch (error: unknown) {
    // Handle errors and send an error response back to the client
    return {
      message: "Address points fetched failed👎",
      error: error instanceof Error ? error.message : error,
    };
  }
}

export const addAddressPoints = async (address: string, data: PointsData) => {
  if (!isValidEVMAddress(address)) {
    return {
      message: "Invalid address",
    };
  }
  try {
    const newPointsObj = {
      ...data,
    };
    // Create a reference to the user's points in the Firebase database
    const addressPointsRef = ref(database, `points/${address.toLocaleLowerCase()}`);
    // Use push method to add the new task object inside the array
    await push(addressPointsRef, newPointsObj);
    return {
      message: "Address points added successfully👍",
      data: newPointsObj,
    };
  } catch (error: unknown) {
    return {
      message: "Address points added failed👎",
      error: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Add UTM to the database
 * @param data Object to add to the database
 * @returns {Object} Response object message and error if any
 */
export const addUTM = async (data: {[kex: string]: string}): Promise<{message: string; error?: any}> => {
  try {
    // Create a reference to the user's points in the Firebase database
    const utmRef = ref(database, `utm`);
    // Use push method to add the new task object inside the array
    await push(utmRef, {
      ...data,
      createdAt: Date.now()
    });
    return {
      message: "UTM added successfully 👍"
    };
  } catch (error: unknown) {
    return {
      message: "UTM added failed 👎",
      error: error instanceof Error ? error.message : error,
    };
  }
}