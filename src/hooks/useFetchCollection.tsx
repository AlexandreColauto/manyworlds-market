import Moralis from "moralis/types";
import React, { useState, useMemo, useCallback } from "react";
import { useMoralis } from "react-moralis";
import { useQuery } from "react-query";

interface dictionary {
  [key: string]: string;
}

type fetchCollection = [
  Moralis.Object<Moralis.Attributes>[],
  dictionary,
  boolean
];

function useFetchCollection() {
  const { enableWeb3, Moralis, isWeb3Enabled, isWeb3EnableLoading, user } =
    useMoralis();
  //use react-query to cache the response from the api, preventing each page from making an additional call to moralis api, resulting in that way in a limit error from the api. with react query the response is stored for about 50s
  const APIFetch = async () => {
    if (!isWeb3Enabled) return;
    //query the collections db from our moralis server
    const Collection = Moralis.Object.extend("collection");
    const query = new Moralis.Query(Collection);
    const results = await query.find();
    return results;
  };
  const cachedCollection = useQuery("collection", APIFetch, {
    enabled: isWeb3Enabled,
    refetchOnWindowFocus: false,
  });

  //exported function to retrieve collections only that belongs to the user (used in mint page/creators dashboard)
  const fetchUserCollection = async (): Promise<
    fetchCollection | [undefined, undefined, boolean]
  > => {
    if (!isWeb3Enabled) return [, , true];
    //get the cached response of the api
    const { isLoading, data } = cachedCollection;
    const address = Moralis.account;
    //create a collection dictionary with the address as key and names as values, this will help to display the correct name in the picklist values and still able to get the correct address for the on chain calls.
    const colDictionary: dictionary = {};
    const loading = isLoading;
    const _results: any = data;
    if (!_results) return [, , isLoading];
    //filter the results to only display the user collections
    const userResults = _results.filter((item: any) => {
      return item.get("owner") === address?.toLowerCase();
    });
    //return the dictionary with the address and names of the users collections
    _results.map((col: any) => {
      const colName = col.get("name");
      const colAdd: string = col.get("collectionAddress").toLowerCase();
      colDictionary[colAdd] = colName;
      return colAdd;
    });

    return [userResults, colDictionary, loading];
  };

  //exported function to retrieve all collections of the Moralis db (used in explore page)
  const fetchAllCollections = async (): Promise<
    fetchCollection | [undefined, undefined, boolean]
  > => {
    !isWeb3Enabled ? await enableWeb3() : null;
    if (!isWeb3Enabled) return [, , true];
    //get the cached response of the api
    const { isLoading, data } = cachedCollection;

    const address = Moralis.account;
    if (!address) return [, , isLoading];
    const loading = isLoading;
    const _results: any = data;
    const colDictionary: dictionary = {};
    if (!_results) return [, , isLoading];
    //create the dictionary with the address and names of all collections
    _results.map((col: any) => {
      const colName = col.get("name");
      const colAdd: string = col.get("collectionAddress").toLowerCase();
      colDictionary[colAdd] = colName;
      return colAdd;
    });
    return [_results, colDictionary, loading];
  };

  return [fetchUserCollection, fetchAllCollections];
}

export default useFetchCollection;
