{
  const port = document.createElement('span');

  port.id = 'stz-obhgtd';
  document.documentElement.append(port);

  const OriginalDate = Date;

  // prefs
  const prefs = {
    updates: [] // update this.#ad of each Date object
  };
  Object.defineProperties(prefs, {
    'offset': {
      get() {
        return parseInt(port.dataset.offset);
      }
    },
    'timezone': {
      get() {
        return port.dataset.timezone;
      }
    }
  });
  port.addEventListener('change', () => prefs.updates.forEach(c => c()));

  /* Date Spoofing */

  class SpoofDate extends Date {
    #ad; // adjusted date
    #isNow = false; // whether it's getting the current time, i.e., new Date()

    #sync() {
      const offset = (prefs.offset + super.getTimezoneOffset());
      this.#ad = new OriginalDate(this.getTime() + offset * 60 * 1000);
    }

    constructor(...args) {
      super(...args);

      if (args.length === 0) {
        this.#isNow = true;
      }

      // Ensure the instance's prototype is SpoofDate.prototype
      Object.setPrototypeOf(this, SpoofDate.prototype);
      prefs.updates.push(() => this.#sync());
      this.#sync();
    }

    getTimezoneOffset() {
      return 0 - prefs.offset;
    }
    /* to string (only supports en locale) */
    toTimeString() {
      if (isNaN(this)) {
        return super.toTimeString();
      }

      const parts = super.toLocaleString.call(this, 'en', {
        timeZone: prefs.timezone,
        timeZoneName: 'longOffset'
      }).split('GMT');

      if (parts.length !== 2) {
        return super.toTimeString();
      }

      const a = 'GMT' + parts[1].replace(':', '');

      const b = super.toLocaleString.call(this, 'en', {
        timeZone: prefs.timezone,
        timeZoneName: 'long'
      }).split(/(AM |PM )/i).pop();

      return super.toTimeString.apply(this.#ad).split(' GMT')[0] + ' ' + a + ' (' + b + ')';
    }
    /* only supports en locale */
    toDateString() {
      return super.toDateString.apply(this.#ad);
    }
    /* only supports en locale */
    toString() {
      if (isNaN(this)) {
        return super.toString();
      }
      return this.toDateString() + ' ' + this.toTimeString();
    }
    toLocaleDateString(...args) {
      args[1] = args[1] || {};
      args[1].timeZone = args[1].timeZone || prefs.timezone;

      return super.toLocaleDateString(...args);
    }
    toLocaleTimeString(...args) {
      args[1] = args[1] || {};
      args[1].timeZone = args[1].timeZone || prefs.timezone;

      return super.toLocaleTimeString(...args);
    }
    toLocaleString(...args) {
      args[1] = args[1] || {};
      args[1].timeZone = args[1].timeZone || prefs.timezone;

      return super.toLocaleString(...args);
    }
    /* get */
    #get(name, ...args) {
      if (this.#isNow) {
        // Directly return the current time
        return super[name].call(this.#ad, ...args);
      }
      else
        return super[name].call(this, ...args);
    }
    getDate(...args) {
      return this.#get('getDate', ...args);
    }
    getDay(...args) {
      return this.#get('getDay', ...args);
    }
    getHours(...args) {
      return this.#get('getHours', ...args);
    }
    getMinutes(...args) {
      return this.#get('getMinutes', ...args);
    }
    getMonth(...args) {
      return this.#get('getMonth', ...args);
    }
    getYear(...args) {
      return this.#get('getYear', ...args);
    }
    getFullYear(...args) {
      return this.#get('getFullYear', ...args);
    }
    /* set */
    #set(type, name, args) {
      if (type === 'ad') {
        const n = this.#ad.getTime();
        const r = this.#get(name, ...args);

        return super.setTime(this.getTime() + r - n);
      }
      else {
        const r = super[name](...args);
        this.#sync();

        return r;
      }
    }
    setHours(...args) {
      return this.#set('ad', 'setHours', args);
    }
    setMinutes(...args) {
      return this.#set('ad', 'setMinutes', args);
    }
    setMonth(...args) {
      return this.#set('ad', 'setMonth', args);
    }
    setDate(...args) {
      return this.#set('ad', 'setDate', args);
    }
    setYear(...args) {
      return this.#set('ad', 'setYear', args);
    }
    setFullYear(...args) {
      return this.#set('ad', 'setFullYear', args);
    }
    setTime(...args) {
      return this.#set('md', 'setTime', args);
    }
    setUTCDate(...args) {
      return this.#set('md', 'setUTCDate', args);
    }
    setUTCFullYear(...args) {
      return this.#set('md', 'setUTCFullYear', args);
    }
    setUTCHours(...args) {
      return this.#set('md', 'setUTCHours', args);
    }
    setUTCMinutes(...args) {
      return this.#set('md', 'setUTCMinutes', args);
    }
    setUTCMonth(...args) {
      return this.#set('md', 'setUTCMonth', args);
    }
  }

/* Bypass detection */

// Use a wrapper function to simulate native Date's behavior
  function SpoofDateWrapper(...args) {
    // If not called with new, then return new SpoofDate(...args).toString()
    if (!(this instanceof SpoofDateWrapper)) {
      return new SpoofDate(...args).toString();
    }
    return new SpoofDate(...args);
  }

  // Make SpoofDateWrapper inherit from SpoofDate's prototype chain
  SpoofDateWrapper.prototype = SpoofDate.prototype;
  SpoofDateWrapper.prototype.constructor = SpoofDateWrapper;

  // Sync SpoofDateWrapper's static properties and methods from native Date (OriginalDate)
  Object.getOwnPropertyNames(OriginalDate).forEach(prop => {
    if (!(prop in SpoofDateWrapper)) {
      try {
        const desc = Object.getOwnPropertyDescriptor(OriginalDate, prop);
        Object.defineProperty(SpoofDateWrapper, prop, desc);
      } catch (e) {
        // Some properties may not be defined, ignore errors
      }
    }
  });

  // Set the constructor's length to 7
  Object.defineProperty(SpoofDateWrapper, "length", { value: 7 });
  // Set the name property to "Date"
  Object.defineProperty(SpoofDateWrapper, "name", { value: "Date" });
  // Override toString so that it returns the native Date's code string
  SpoofDateWrapper.toString = function () {
    return "function Date() { [native code] }";
  };

  // Set SpoofDate's prototype to the native Date's prototype (so instances have native Date's methods)
  SpoofDate.prototype = OriginalDate.prototype;

  // Override getTimezoneOffset method's toString to mimic native code output
  Object.defineProperty(SpoofDate.prototype.getTimezoneOffset, 'toString', {
    value: function () {
      return 'function getTimezoneOffset() { [native code] }';
    },
    writable: false,
    configurable: false
  });

  /* override */
  // Use Proxy to replace the global Date, intercepting both function calls and constructor calls
  self.Date = new Proxy(SpoofDateWrapper, {
    apply(target, thisArg, argumentsList) {
      // When called as a function
      return target(...argumentsList);
    },
    construct(target, argumentsList, newTarget) {
      // When called with new
      if (argumentsList.length === 1 && typeof argumentsList[0] === "string") {
        const dateStr = argumentsList[0];
        // Adjust parsing logic based on different formats:
        if (/\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
          // MM/DD/YYYY format: use custom local time parsing logic
          const timestamp = OriginalDate.parse(dateStr);
          return new target(timestamp);
        }
        else if (/\d{4}-\d{2}-\d{2}/.test(dateStr)) {
          // YYYY-MM-DD format: treat as UTC time
          const timestamp = OriginalDate.parse(dateStr);
          now = new OriginalDate();
          const offset = (prefs.offset + now.getTimezoneOffset());
          return new target(timestamp + offset * 60 * 1000);
        }
      }
      return new target(...argumentsList);
    }
  });

  /* Intl Spoofing */
  class SpoofDateTimeFormat extends Intl.DateTimeFormat {
    constructor(...args) {
      // Ensure the options object exists
      if (!args[1]) {
        args[1] = {};
      }
      // If no timeZone is specified, use the value from port
      if (!args[1].timeZone) {
        args[1].timeZone = port.dataset.timezone;
      }
      super(...args);
    }
    // Override resolvedOptions method to return spoofed timezone information
    resolvedOptions() {
      let options = super.resolvedOptions();
      options.timeZone = port.dataset.timezone;
      return options;
    }
  }

  // Use Proxy to wrap SpoofDateTimeFormat, ensuring the call behavior is identical to native
  Intl.DateTimeFormat = new Proxy(SpoofDateTimeFormat, {
    apply(target, thisArg, args) {
      return new SpoofDateTimeFormat(...args);
    },
    construct(target, args) {
      return new SpoofDateTimeFormat(...args);
    }
  });
}

/* for iframe[sandbox] */
window.addEventListener('message', e => {
  if (e.data === 'spoof-sandbox-frame') {
    e.stopPropagation();
    e.preventDefault();
    try {
      e.source.Date = Date;
      e.source.Intl.DateTimeFormat = Intl.DateTimeFormat;
    }
    catch (e) { }
  }
});