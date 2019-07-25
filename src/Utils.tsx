const replaceStringParam = (
  str: string,
  param: any,
  stylize: boolean = true
): string => {
  let count: number = 0;

  if (stylize) str = stylizeDesc(str);

  while (str.includes("%s") && count < 10) {
    let paramValue = param[count] ? param[count] : 0;
    str = str.replace("%s", paramValue);
    count++;
  }

  return str;
};

const stylizeDesc = (str: string): string => {
  return str
    .replace(/\[8df936\]/g, `<span class="desc-style-3">`)
    .replace(/\[-\]/g, `</span>`)
    .replace(/\[/g, `<span class="desc-style-1">`)
    .replace(/\]/g, `</span>`)
    .replace(/%s/g, `<span class="desc-style-2">%s</span>`)
    .replace(/%%/g, `<span class="desc-style-2">%</span>`);
};

const min = (obj: any, prop?: string) => {
  if (prop) {
    return obj.reduce((prev: any, curobj: any, ii: any, iii: any) => {
      return curobj[prop] > prev[prop] ? prev : curobj;
    });
  } else {
    return Math.min(...obj);
  }
};
const max = (obj: any, prop?: string) => {
  if (prop) {
    return obj.reduce((prev: any, curobj: any, ii: any, iii: any) => {
      return curobj[prop] < prev[prop] ? prev : curobj;
    });
  } else {
    return Math.max(...obj);
  }
};

const remove = (fromObj: any, key: string, value: any) => {
  return fromObj.filter((a: any, b: any) => {
    return a[key] !== value ? true : false;
  });
};

const uniquePush = (arr: any[], value: any) => {
  if (arr.indexOf(value) === -1) {
    arr.push(value);
  }
  return arr;
};

const mergeArray = (...arrays: any[]) => {
  let jointArrays: any[] = [];

  // Merge array.
  arrays.forEach(array => {
    jointArrays = [...jointArrays, ...array];
  });

  // Filter duplicates and return.
  return jointArrays.filter(
    (item, index) => jointArrays.indexOf(item) === index
  );
};

const filterDifferentArray = (arrA: any, arrB: any) => {
  return arrA
    .filter((x: any) => !arrB.includes(x))
    .concat(arrB.filter((x: any) => !arrA.includes(x)));
};

const numberWithCommas = (number: number): string => {
  if (number === undefined) number = 0;
  return number.toLocaleString();
};

const getPropertyLang = (property: string, lang: string = "CN"): string => {
  // Temporarily disable i8n
  //return `${property}${lang === "CN" ? "" : "_" + lang}`;
  return property;
};

const array_sum = (array1: number[], array2: number[]) => {
  if(array1.length !== array2.length) return array1;

  return array1.map((val: number, index: number) => {
    return parseFloat(
      (
        parseFloat(val.toFixed(2)) + parseFloat(array2[index].toFixed(2))
      ).toFixed(2)
    );
  });
};

export {
  min,
  max,
  remove,
  uniquePush,
  replaceStringParam,
  numberWithCommas,
  getPropertyLang,
  array_sum,
  stylizeDesc,
  mergeArray,
  filterDifferentArray
};

export default {
  min,
  max,
  remove,
  uniquePush,
  replaceStringParam,
  numberWithCommas,
  getPropertyLang,
  array_sum,
  stylizeDesc,
  mergeArray,
  filterDifferentArray
};
