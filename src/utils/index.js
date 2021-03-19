export const fetchData = ({resolver}) => new Promise((resolve, reject) => resolver({resolve, reject}))

export const  sortDomNodes = ({field, reverse, primer}) => {
    const [aObj, bObj] = [
        JSON.parse(a.getAttribute("row-value").replaceAll(`'`, `"`)),
        JSON.parse(b.getAttribute("row-value").replaceAll(`'`, `"`)),
      ];
    const key = primer ?
        function(x) {
        return primer(x[field])
        } :
        function(x) {
        return x[field]
        };
    
    reverse = !reverse ? 1 : -1;
    
    return (aObj, bObj) => {
        return aObj = key(aObj), bObj = key(bObj), reverse * ((aObj > bObj) - (bObj > aObj));
    }
}