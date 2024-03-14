var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const app = "";
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function null_to_empty(value) {
  return value == null ? "" : value;
}
function append(target, node) {
  target.appendChild(node);
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}
function destroy_each(iterations, detaching) {
  for (let i = 0; i < iterations.length; i += 1) {
    if (iterations[i])
      iterations[i].d(detaching);
  }
}
function element(name) {
  return document.createElement(name);
}
function svg_element(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}
function text(data) {
  return document.createTextNode(data);
}
function space() {
  return text(" ");
}
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
function children(element2) {
  return Array.from(element2.childNodes);
}
function set_data(text2, data) {
  data = "" + data;
  if (text2.wholeText !== data)
    text2.data = data;
}
function select_option(select, value) {
  for (let i = 0; i < select.options.length; i += 1) {
    const option = select.options[i];
    if (option.__value === value) {
      option.selected = true;
      return;
    }
  }
  select.selectedIndex = -1;
}
function select_value(select) {
  const selected_option = select.querySelector(":checked") || select.options[0];
  return selected_option && selected_option.__value;
}
class HtmlTag {
  constructor(is_svg = false) {
    this.is_svg = false;
    this.is_svg = is_svg;
    this.e = this.n = null;
  }
  c(html) {
    this.h(html);
  }
  m(html, target, anchor = null) {
    if (!this.e) {
      if (this.is_svg)
        this.e = svg_element(target.nodeName);
      else
        this.e = element(target.nodeName);
      this.t = target;
      this.c(html);
    }
    this.i(anchor);
  }
  h(html) {
    this.e.innerHTML = html;
    this.n = Array.from(this.e.childNodes);
  }
  i(anchor) {
    for (let i = 0; i < this.n.length; i += 1) {
      insert(this.t, this.n[i], anchor);
    }
  }
  p(html) {
    this.d();
    this.h(html);
    this.i(this.a);
  }
  d() {
    this.n.forEach(detach);
  }
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function onMount(fn) {
  get_current_component().$$.on_mount.push(fn);
}
const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
function add_flush_callback(fn) {
  flush_callbacks.push(fn);
}
const seen_callbacks = /* @__PURE__ */ new Set();
let flushidx = 0;
function flush() {
  if (flushidx !== 0) {
    return;
  }
  const saved_component = current_component;
  do {
    try {
      while (flushidx < dirty_components.length) {
        const component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
    } catch (e) {
      dirty_components.length = 0;
      flushidx = 0;
      throw e;
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
const outroing = /* @__PURE__ */ new Set();
let outros;
function group_outros() {
  outros = {
    r: 0,
    c: [],
    p: outros
    // parent group
  };
}
function check_outros() {
  if (!outros.r) {
    run_all(outros.c);
  }
  outros = outros.p;
}
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
function transition_out(block, local, detach2, callback) {
  if (block && block.o) {
    if (outroing.has(block))
      return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback) {
        if (detach2)
          block.d(1);
        callback();
      }
    });
    block.o(local);
  } else if (callback) {
    callback();
  }
}
function bind(component, name, callback) {
  const index = component.$$.props[name];
  if (index !== void 0) {
    component.$$.bound[index] = callback;
    callback(component.$$.ctx[index]);
  }
}
function create_component(block) {
  block && block.c();
}
function mount_component(component, target, anchor, customElement) {
  const { fragment, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  if (!customElement) {
    add_render_callback(() => {
      const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
      if (component.$$.on_destroy) {
        component.$$.on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
  }
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance2, create_fragment2, not_equal, props, append_styles, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: [],
    // state
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    // lifecycle
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    // everything else
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles && append_styles($$.root);
  let ready = false;
  $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    flush();
  }
  set_current_component(parent_component);
}
class SvelteComponent {
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }
  $on(type, callback) {
    if (!is_function(callback)) {
      return noop;
    }
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1)
        callbacks.splice(index, 1);
    };
  }
  $set($$props) {
    if (this.$$set && !is_empty($$props)) {
      this.$$.skip_bound = true;
      this.$$set($$props);
      this.$$.skip_bound = false;
    }
  }
}
const Card_svelte_svelte_type_style_lang = "";
function create_if_block_2$1(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      attr(div, "class", "front svelte-tkacgb");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      div.innerHTML = /*frontData*/
      ctx[1];
    },
    p(ctx2, dirty) {
      if (dirty & /*frontData*/
      2)
        div.innerHTML = /*frontData*/
        ctx2[1];
    },
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function create_if_block$1(ctx) {
  let div;
  let html_tag;
  let t;
  let if_block = (
    /*tags*/
    ctx[3] && create_if_block_1$1(ctx)
  );
  return {
    c() {
      div = element("div");
      html_tag = new HtmlTag(false);
      t = space();
      if (if_block)
        if_block.c();
      html_tag.a = t;
      attr(div, "class", "back svelte-tkacgb");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      html_tag.m(
        /*backData*/
        ctx[2],
        div
      );
      append(div, t);
      if (if_block)
        if_block.m(div, null);
    },
    p(ctx2, dirty) {
      if (dirty & /*backData*/
      4)
        html_tag.p(
          /*backData*/
          ctx2[2]
        );
      if (
        /*tags*/
        ctx2[3]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_1$1(ctx2);
          if_block.c();
          if_block.m(div, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if (if_block)
        if_block.d();
    }
  };
}
function create_if_block_1$1(ctx) {
  let p;
  let t;
  let html_tag;
  return {
    c() {
      p = element("p");
      t = text("tags: ");
      html_tag = new HtmlTag(false);
      html_tag.a = null;
    },
    m(target, anchor) {
      insert(target, p, anchor);
      append(p, t);
      html_tag.m(
        /*tags*/
        ctx[3],
        p
      );
    },
    p(ctx2, dirty) {
      if (dirty & /*tags*/
      8)
        html_tag.p(
          /*tags*/
          ctx2[3]
        );
    },
    d(detaching) {
      if (detaching)
        detach(p);
    }
  };
}
function create_fragment$3(ctx) {
  let div;
  let t;
  let div_class_value;
  let mounted;
  let dispose;
  let if_block0 = (
    /*front*/
    ctx[4] && create_if_block_2$1(ctx)
  );
  let if_block1 = !/*front*/
  ctx[4] && create_if_block$1(ctx);
  return {
    c() {
      div = element("div");
      if (if_block0)
        if_block0.c();
      t = space();
      if (if_block1)
        if_block1.c();
      attr(div, "class", div_class_value = null_to_empty(
        /*front*/
        ctx[4] ? "cardInner" : "cardInnerFlipped"
      ) + " svelte-tkacgb");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if (if_block0)
        if_block0.m(div, null);
      append(div, t);
      if (if_block1)
        if_block1.m(div, null);
      if (!mounted) {
        dispose = listen(
          div,
          "click",
          /*flip*/
          ctx[0]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (
        /*front*/
        ctx2[4]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_2$1(ctx2);
          if_block0.c();
          if_block0.m(div, t);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (!/*front*/
      ctx2[4]) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block$1(ctx2);
          if_block1.c();
          if_block1.m(div, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (dirty & /*front*/
      16 && div_class_value !== (div_class_value = null_to_empty(
        /*front*/
        ctx2[4] ? "cardInner" : "cardInnerFlipped"
      ) + " svelte-tkacgb")) {
        attr(div, "class", div_class_value);
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      mounted = false;
      dispose();
    }
  };
}
function instance$3($$self, $$props, $$invalidate) {
  let front = true;
  const flip = () => {
    if (!window.getSelection().toString()) {
      $$invalidate(4, front = !front);
    }
  };
  let { frontData = "front of card" } = $$props;
  let { backData = "back of card" } = $$props;
  let { tags } = $$props;
  $$self.$$set = ($$props2) => {
    if ("frontData" in $$props2)
      $$invalidate(1, frontData = $$props2.frontData);
    if ("backData" in $$props2)
      $$invalidate(2, backData = $$props2.backData);
    if ("tags" in $$props2)
      $$invalidate(3, tags = $$props2.tags);
  };
  return [flip, frontData, backData, tags, front];
}
class Card extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, {
      flip: 0,
      frontData: 1,
      backData: 2,
      tags: 3
    });
  }
  get flip() {
    return this.$$.ctx[0];
  }
}
const Counter_svelte_svelte_type_style_lang = "";
function create_fragment$2(ctx) {
  let div;
  let p0;
  let t0_value = (
    /*currCardIndex*/
    ctx[0] + 1 + ""
  );
  let t0;
  let t1;
  let p1;
  let t3;
  let p2;
  let t4;
  return {
    c() {
      div = element("div");
      p0 = element("p");
      t0 = text(t0_value);
      t1 = space();
      p1 = element("p");
      p1.textContent = "/";
      t3 = space();
      p2 = element("p");
      t4 = text(
        /*totalCards*/
        ctx[1]
      );
      attr(p0, "class", "svelte-1stcjer");
      attr(p1, "class", "svelte-1stcjer");
      attr(p2, "class", "svelte-1stcjer");
      attr(div, "class", "counter svelte-1stcjer");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, p0);
      append(p0, t0);
      append(div, t1);
      append(div, p1);
      append(div, t3);
      append(div, p2);
      append(p2, t4);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*currCardIndex*/
      1 && t0_value !== (t0_value = /*currCardIndex*/
      ctx2[0] + 1 + ""))
        set_data(t0, t0_value);
      if (dirty & /*totalCards*/
      2)
        set_data(
          t4,
          /*totalCards*/
          ctx2[1]
        );
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function instance$2($$self, $$props, $$invalidate) {
  let { currCardIndex } = $$props;
  let { totalCards } = $$props;
  $$self.$$set = ($$props2) => {
    if ("currCardIndex" in $$props2)
      $$invalidate(0, currCardIndex = $$props2.currCardIndex);
    if ("totalCards" in $$props2)
      $$invalidate(1, totalCards = $$props2.totalCards);
  };
  return [currCardIndex, totalCards];
}
class Counter extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, { currCardIndex: 0, totalCards: 1 });
  }
}
const Navigate_svelte_svelte_type_style_lang = "";
function create_fragment$1(ctx) {
  let div;
  let button0;
  let t1;
  let button1;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      button0 = element("button");
      button0.textContent = "prev";
      t1 = space();
      button1 = element("button");
      button1.textContent = "next";
      attr(button0, "class", "svelte-6mz84w");
      attr(button1, "class", "svelte-6mz84w");
      attr(div, "class", "navigate svelte-6mz84w");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, button0);
      append(div, t1);
      append(div, button1);
      if (!mounted) {
        dispose = [
          listen(
            button0,
            "click",
            /*prev*/
            ctx[0]
          ),
          listen(
            button1,
            "click",
            /*next*/
            ctx[1]
          )
        ];
        mounted = true;
      }
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$1($$self, $$props, $$invalidate) {
  let { currCardIndex } = $$props;
  let { totalCards } = $$props;
  const prev = () => {
    if (currCardIndex - 1 < 0) {
      $$invalidate(2, currCardIndex = totalCards - 1);
    } else {
      $$invalidate(2, currCardIndex--, currCardIndex);
    }
  };
  const next = () => {
    if (currCardIndex + 1 > totalCards - 1) {
      $$invalidate(2, currCardIndex = 0);
    } else {
      $$invalidate(2, currCardIndex++, currCardIndex);
    }
  };
  $$self.$$set = ($$props2) => {
    if ("currCardIndex" in $$props2)
      $$invalidate(2, currCardIndex = $$props2.currCardIndex);
    if ("totalCards" in $$props2)
      $$invalidate(3, totalCards = $$props2.totalCards);
  };
  return [prev, next, currCardIndex, totalCards];
}
class Navigate extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, {
      currCardIndex: 2,
      totalCards: 3,
      prev: 0,
      next: 1
    });
  }
  get prev() {
    return this.$$.ctx[0];
  }
  get next() {
    return this.$$.ctx[1];
  }
}
class Mapper {
  // use this class to create methods for
  // converting arbitrary json data to an array of {'front': '', 'back': ''} objects,
  // which is what Card.svelte expects
  // if there's a new json dataset, a new mapper method should be made to be able to process it
  // we expect chinese character datasets
  // to be arranged like an array of {"value": "匂", "pinyin": "xiong1", "definition": "fragrance, smell;", "tags": []}
  // we want to show the character on the front of a card and the pinyin and definition on the back of the card
  // TODO: create an interface for the expected incoming dataset format
  // TODO: maybe pass back the fields and values to display and let whoever is receiving this data handle the html presentation
  generateTagsHtml(tagList) {
    const tags = tagList.map((currVal) => `<span class='tag'>${currVal}</span>`);
    return tags.join(",");
  }
  processChineseDataset(jsonData) {
    return jsonData.map((obj) => {
      return {
        front: `<p>${obj.value}</p>`,
        back: `<p><span class='field'>pinyin:</span> ${obj.pinyin}</p> <p><span class='field'>definition:</span> ${obj.definition}</p>`,
        value: obj.value,
        pinyin: obj.pinyin,
        tags: obj.tags ? this.generateTagsHtml(obj.tags) : ""
        //obj.tags.reduce((acc, currVal) => acc + `<span class='tag'>${currVal}</span>`, "") : "",
      };
    });
  }
  // example data: {"value": "暗記", "romaji": "anki (あんき)", "definition": "memorization"}
  processJapaneseDataset(jsonData) {
    return jsonData.map((obj) => {
      return {
        front: `<p>${obj.value}</p>`,
        back: `<p><span class='field'>romaji:</span> ${obj.romaji}</p> <p><span class='field'>definition:</span> ${obj.definition}</p>`,
        tags: obj.tags ? this.generateTagsHtml(obj.tags) : ""
      };
    });
  }
  // example data: {"character": "ㄅ", "pinyin": "b"}
  processBopomofoDataset(jsonData) {
    return jsonData.map((obj) => {
      return {
        front: `<p>${obj.character}</p>`,
        back: `<p><span class='field'>pinyin:</span> ${obj.pinyin}</p>`
      };
    });
  }
  // example data: {"value": "多謝", "jyutping": "do1 ze6", "definition": "thank you"}
  processCantoneseDataset(jsonData) {
    return jsonData.map((obj) => {
      return {
        front: `<p>${obj.value}</p>`,
        back: `<p><span class='field'>jyutping:</span> ${obj.jyutping}</p> <p><span class='field'>definition:</span> ${obj.definition}</p>`,
        value: obj.value,
        jyutping: obj.jyutping
      };
    });
  }
}
class DrawingCanvas {
  constructor(worker) {
    __publicField(this, "canvas");
    __publicField(this, "worker");
    // web worker to communicate with
    __publicField(this, "clicking");
    __publicField(this, "lastTouchX");
    __publicField(this, "lastTouchY");
    __publicField(this, "timestamp");
    __publicField(this, "strokeWidth");
    __publicField(this, "lastPoint");
    __publicField(this, "rawStrokes");
    // array of strokes, where a stroke is an array of coordinates, and each coordinate is an array containing an x and y value
    __publicField(this, "currStroke");
    this.init();
    this.worker = worker;
    this.clicking = false;
    this.lastTouchX = -1;
    this.lastTouchY = -1;
    this.strokeWidth = 5;
    this.rawStrokes = [];
    this.currStroke = [];
  }
  init() {
    const canvasElement = document.createElement("canvas");
    canvasElement.width = 256;
    canvasElement.height = 256;
    canvasElement.style.backgroundColor = "#fff";
    canvasElement.style.margin = "0 auto";
    canvasElement.style.border = "1px solid #000";
    canvasElement.addEventListener("pointermove", (e) => {
      if (!this.clicking)
        return;
      const x = e.pageX - canvasElement.getBoundingClientRect().left;
      const y = e.pageY - canvasElement.getBoundingClientRect().top;
      this.dragClick(x, y);
    });
    canvasElement.addEventListener("pointerdown", (e) => {
      const x = e.pageX - canvasElement.getBoundingClientRect().left;
      const y = e.pageY - canvasElement.getBoundingClientRect().top;
      this.startClick(x, y);
    });
    canvasElement.addEventListener("pointerup", (e) => {
      const x = e.pageX - canvasElement.getBoundingClientRect().left;
      const y = e.pageY - canvasElement.getBoundingClientRect().top;
      this.endClick(x, y);
    });
    canvasElement.addEventListener("touchmove", (e) => {
      if (!this.clicking)
        return;
      e.preventDefault();
      const x = e.touches[0].pageX - canvasElement.getBoundingClientRect().left;
      const y = e.touches[0].pageY - canvasElement.getBoundingClientRect().top;
      this.lastTouchX = x;
      this.lastTouchY = y;
      this.dragClick(x, y);
    });
    canvasElement.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const x = e.touches[0].pageX - canvasElement.getBoundingClientRect().left;
      const y = e.touches[0].pageY - canvasElement.getBoundingClientRect().top;
      this.startClick(x, y);
    });
    canvasElement.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.endClick(this.lastTouchX, this.lastTouchY);
      this.lastTouchX = -1;
      this.lastTouchY = -1;
    });
    this.canvas = canvasElement;
    this.drawClearCanvas();
  }
  // clears canvas and draws gridlines
  drawClearCanvas() {
    const ctx = this.canvas.getContext("2d");
    const width = this.canvas.width;
    const height = this.canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.setLineDash([1, 1]);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width, 0);
    ctx.lineTo(0, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }
  startClick(x, y) {
    this.clicking = true;
    this.currStroke = [];
    this.lastPoint = [x, y];
    this.currStroke.push(this.lastPoint);
    const ctx = this.canvas.getContext("2d");
    ctx.strokeStyle = "#000";
    ctx.setLineDash([]);
    ctx.lineWidth = this.strokeWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    this.timestamp = new Date();
  }
  dragClick(x, y) {
    if (this.timestamp && new Date().getTime() - this.timestamp.getTime() < 50) {
      return;
    }
    this.timestamp = new Date();
    const point = [x, y];
    if (this.lastPoint && point[0] === this.lastPoint[0] && point[1] === this.lastPoint[1]) {
      return;
    }
    this.currStroke.push(point);
    this.lastPoint = point;
    const ctx = this.canvas.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  endClick(x, y) {
    this.clicking = false;
    if (x === -1)
      return;
    const ctx = this.canvas.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
    this.currStroke.push([x, y]);
    this.rawStrokes.push(this.currStroke);
    this.currStroke = [];
  }
  // get the hand-drawn input strokes and try to find a character match
  lookup() {
    this.worker.postMessage({ strokes: this.rawStrokes, limit: 8 });
  }
  getCanvas() {
    return this.canvas;
  }
}
const App_svelte_svelte_type_style_lang = "";
function get_if_ctx(ctx) {
  const child_ctx = ctx.slice();
  const constants_0 = (
    /*getPossibleQuizAnswers*/
    child_ctx[15](
      /*currCardIndex*/
      child_ctx[3]
    )
  );
  child_ctx[32] = constants_0;
  return child_ctx;
}
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[33] = list[i];
  return child_ctx;
}
function create_each_block(ctx) {
  let option;
  let t_value = (
    /*ds*/
    ctx[33] + ""
  );
  let t;
  return {
    c() {
      option = element("option");
      t = text(t_value);
      option.__value = /*ds*/
      ctx[33];
      option.value = option.__value;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t);
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(option);
    }
  };
}
function create_if_block_4(ctx) {
  let button;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      attr(button, "class", "pencil-button svelte-irb86v");
    },
    m(target, anchor) {
      insert(target, button, anchor);
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*openDrawingCanvas*/
          ctx[19]
        );
        mounted = true;
      }
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(button);
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_3(ctx) {
  let button;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      button.textContent = "quiz mode";
      attr(button, "id", "changeModeButton");
      attr(button, "class", "svelte-irb86v");
    },
    m(target, anchor) {
      insert(target, button, anchor);
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*changeMode*/
          ctx[14]
        );
        mounted = true;
      }
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(button);
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_2(ctx) {
  let div;
  let h2;
  let t0;
  let t1_value = (
    /*filteredData*/
    ctx[2][
      /*currCardIndex*/
      ctx[3]
    ].value + ""
  );
  let t1;
  let t2;
  let t3;
  let button0;
  let t4_value = (
    /*possibleAnswers*/
    ctx[32][0].pinyin + ""
  );
  let t4;
  let t5;
  let button1;
  let t6_value = (
    /*possibleAnswers*/
    ctx[32][1].pinyin + ""
  );
  let t6;
  let t7;
  let button2;
  let t8_value = (
    /*possibleAnswers*/
    ctx[32][2].pinyin + ""
  );
  let t8;
  let t9;
  let button3;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      h2 = element("h2");
      t0 = text("what is the pinyin for ");
      t1 = text(t1_value);
      t2 = text("?");
      t3 = space();
      button0 = element("button");
      t4 = text(t4_value);
      t5 = space();
      button1 = element("button");
      t6 = text(t6_value);
      t7 = space();
      button2 = element("button");
      t8 = text(t8_value);
      t9 = space();
      button3 = element("button");
      button3.textContent = "next";
      attr(button0, "class", "quiz-answer-choice svelte-irb86v");
      attr(button1, "class", "quiz-answer-choice svelte-irb86v");
      attr(button2, "class", "quiz-answer-choice svelte-irb86v");
      attr(button3, "class", "svelte-irb86v");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, h2);
      append(h2, t0);
      append(h2, t1);
      append(h2, t2);
      append(div, t3);
      append(div, button0);
      append(button0, t4);
      append(div, t5);
      append(div, button1);
      append(button1, t6);
      append(div, t7);
      append(div, button2);
      append(button2, t8);
      append(div, t9);
      append(div, button3);
      if (!mounted) {
        dispose = [
          listen(
            button0,
            "click",
            /*checkQuizAnswer*/
            ctx[16]
          ),
          listen(
            button1,
            "click",
            /*checkQuizAnswer*/
            ctx[16]
          ),
          listen(
            button2,
            "click",
            /*checkQuizAnswer*/
            ctx[16]
          ),
          listen(
            button3,
            "click",
            /*shuffle*/
            ctx[13]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*filteredData, currCardIndex*/
      12 && t1_value !== (t1_value = /*filteredData*/
      ctx2[2][
        /*currCardIndex*/
        ctx2[3]
      ].value + ""))
        set_data(t1, t1_value);
      if (dirty[0] & /*currCardIndex*/
      8 && t4_value !== (t4_value = /*possibleAnswers*/
      ctx2[32][0].pinyin + ""))
        set_data(t4, t4_value);
      if (dirty[0] & /*currCardIndex*/
      8 && t6_value !== (t6_value = /*possibleAnswers*/
      ctx2[32][1].pinyin + ""))
        set_data(t6, t6_value);
      if (dirty[0] & /*currCardIndex*/
      8 && t8_value !== (t8_value = /*possibleAnswers*/
      ctx2[32][2].pinyin + ""))
        set_data(t8, t8_value);
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block(ctx) {
  let counter;
  let updating_currCardIndex;
  let updating_totalCards;
  let t0;
  let div;
  let t1;
  let navigate;
  let updating_currCardIndex_1;
  let updating_totalCards_1;
  let current;
  function counter_currCardIndex_binding(value) {
    ctx[21](value);
  }
  function counter_totalCards_binding(value) {
    ctx[22](value);
  }
  let counter_props = {};
  if (
    /*currCardIndex*/
    ctx[3] !== void 0
  ) {
    counter_props.currCardIndex = /*currCardIndex*/
    ctx[3];
  }
  if (
    /*totalCards*/
    ctx[4] !== void 0
  ) {
    counter_props.totalCards = /*totalCards*/
    ctx[4];
  }
  counter = new Counter({ props: counter_props });
  binding_callbacks.push(() => bind(counter, "currCardIndex", counter_currCardIndex_binding));
  binding_callbacks.push(() => bind(counter, "totalCards", counter_totalCards_binding));
  let if_block = (
    /*totalCards*/
    ctx[4] > 0 && create_if_block_1(ctx)
  );
  function navigate_currCardIndex_binding(value) {
    ctx[25](value);
  }
  function navigate_totalCards_binding(value) {
    ctx[26](value);
  }
  let navigate_props = {};
  if (
    /*currCardIndex*/
    ctx[3] !== void 0
  ) {
    navigate_props.currCardIndex = /*currCardIndex*/
    ctx[3];
  }
  if (
    /*totalCards*/
    ctx[4] !== void 0
  ) {
    navigate_props.totalCards = /*totalCards*/
    ctx[4];
  }
  navigate = new Navigate({ props: navigate_props });
  ctx[24](navigate);
  binding_callbacks.push(() => bind(navigate, "currCardIndex", navigate_currCardIndex_binding));
  binding_callbacks.push(() => bind(navigate, "totalCards", navigate_totalCards_binding));
  return {
    c() {
      create_component(counter.$$.fragment);
      t0 = space();
      div = element("div");
      if (if_block)
        if_block.c();
      t1 = space();
      create_component(navigate.$$.fragment);
      attr(div, "class", "card-container svelte-irb86v");
    },
    m(target, anchor) {
      mount_component(counter, target, anchor);
      insert(target, t0, anchor);
      insert(target, div, anchor);
      if (if_block)
        if_block.m(div, null);
      insert(target, t1, anchor);
      mount_component(navigate, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const counter_changes = {};
      if (!updating_currCardIndex && dirty[0] & /*currCardIndex*/
      8) {
        updating_currCardIndex = true;
        counter_changes.currCardIndex = /*currCardIndex*/
        ctx2[3];
        add_flush_callback(() => updating_currCardIndex = false);
      }
      if (!updating_totalCards && dirty[0] & /*totalCards*/
      16) {
        updating_totalCards = true;
        counter_changes.totalCards = /*totalCards*/
        ctx2[4];
        add_flush_callback(() => updating_totalCards = false);
      }
      counter.$set(counter_changes);
      if (
        /*totalCards*/
        ctx2[4] > 0
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*totalCards*/
          16) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_1(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(div, null);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
      const navigate_changes = {};
      if (!updating_currCardIndex_1 && dirty[0] & /*currCardIndex*/
      8) {
        updating_currCardIndex_1 = true;
        navigate_changes.currCardIndex = /*currCardIndex*/
        ctx2[3];
        add_flush_callback(() => updating_currCardIndex_1 = false);
      }
      if (!updating_totalCards_1 && dirty[0] & /*totalCards*/
      16) {
        updating_totalCards_1 = true;
        navigate_changes.totalCards = /*totalCards*/
        ctx2[4];
        add_flush_callback(() => updating_totalCards_1 = false);
      }
      navigate.$set(navigate_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(counter.$$.fragment, local);
      transition_in(if_block);
      transition_in(navigate.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(counter.$$.fragment, local);
      transition_out(if_block);
      transition_out(navigate.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(counter, detaching);
      if (detaching)
        detach(t0);
      if (detaching)
        detach(div);
      if (if_block)
        if_block.d();
      if (detaching)
        detach(t1);
      ctx[24](null);
      destroy_component(navigate, detaching);
    }
  };
}
function create_if_block_1(ctx) {
  let card;
  let current;
  let card_props = {
    frontData: (
      /*filteredData*/
      ctx[2][
        /*currCardIndex*/
        ctx[3]
      ].front
    ),
    backData: (
      /*filteredData*/
      ctx[2][
        /*currCardIndex*/
        ctx[3]
      ].back
    ),
    tags: (
      /*filteredData*/
      ctx[2][
        /*currCardIndex*/
        ctx[3]
      ].tags
    )
  };
  card = new Card({ props: card_props });
  ctx[23](card);
  return {
    c() {
      create_component(card.$$.fragment);
    },
    m(target, anchor) {
      mount_component(card, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const card_changes = {};
      if (dirty[0] & /*filteredData, currCardIndex*/
      12)
        card_changes.frontData = /*filteredData*/
        ctx2[2][
          /*currCardIndex*/
          ctx2[3]
        ].front;
      if (dirty[0] & /*filteredData, currCardIndex*/
      12)
        card_changes.backData = /*filteredData*/
        ctx2[2][
          /*currCardIndex*/
          ctx2[3]
        ].back;
      if (dirty[0] & /*filteredData, currCardIndex*/
      12)
        card_changes.tags = /*filteredData*/
        ctx2[2][
          /*currCardIndex*/
          ctx2[3]
        ].tags;
      card.$set(card_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(card.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(card.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      ctx[23](null);
      destroy_component(card, detaching);
    }
  };
}
function create_fragment(ctx) {
  let button0;
  let t0;
  let header;
  let p0;
  let t2;
  let select;
  let t3;
  let p1;
  let t5;
  let p2;
  let t7;
  let input0;
  let t8;
  let t9;
  let div;
  let input1;
  let t10;
  let label0;
  let t12;
  let input2;
  let t13;
  let label1;
  let t15;
  let input3;
  let t16;
  let label2;
  let t18;
  let button1;
  let t20;
  let header_class_value;
  let t21;
  let main;
  let h1;
  let t23;
  let current_block_type_index;
  let if_block2;
  let t24;
  let br;
  let current;
  let mounted;
  let dispose;
  let each_value = (
    /*datasets*/
    ctx[8]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  let if_block0 = (
    /*selected*/
    ctx[0] === "chinese" && create_if_block_4(ctx)
  );
  let if_block1 = (
    /*selected*/
    ctx[0] === "chinese" && create_if_block_3(ctx)
  );
  const if_block_creators = [create_if_block, create_if_block_2];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*currMode*/
      ctx2[1] === "flashcard"
    )
      return 0;
    if (
      /*currMode*/
      ctx2[1] === "quiz"
    )
      return 1;
    return -1;
  }
  function select_block_ctx(ctx2, index) {
    if (index === 1)
      return get_if_ctx(ctx2);
    return ctx2;
  }
  if (~(current_block_type_index = select_block_type(ctx))) {
    if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](select_block_ctx(ctx, current_block_type_index));
  }
  return {
    c() {
      button0 = element("button");
      button0.innerHTML = `<i class="fa fa-bars"></i>`;
      t0 = space();
      header = element("header");
      p0 = element("p");
      p0.textContent = "dataset:";
      t2 = space();
      select = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t3 = space();
      p1 = element("p");
      p1.textContent = "|";
      t5 = space();
      p2 = element("p");
      p2.textContent = "search:";
      t7 = space();
      input0 = element("input");
      t8 = space();
      if (if_block0)
        if_block0.c();
      t9 = space();
      div = element("div");
      input1 = element("input");
      t10 = space();
      label0 = element("label");
      label0.textContent = "front";
      t12 = space();
      input2 = element("input");
      t13 = space();
      label1 = element("label");
      label1.textContent = "back";
      t15 = space();
      input3 = element("input");
      t16 = space();
      label2 = element("label");
      label2.textContent = "tag";
      t18 = space();
      button1 = element("button");
      button1.textContent = "shuffle";
      t20 = space();
      if (if_block1)
        if_block1.c();
      t21 = space();
      main = element("main");
      h1 = element("h1");
      h1.textContent = "flashcards";
      t23 = space();
      if (if_block2)
        if_block2.c();
      t24 = space();
      br = element("br");
      attr(button0, "class", "icon svelte-irb86v");
      attr(p0, "class", "svelte-irb86v");
      attr(select, "class", "svelte-irb86v");
      if (
        /*selected*/
        ctx[0] === void 0
      )
        add_render_callback(() => (
          /*select_change_handler*/
          ctx[20].call(select)
        ));
      attr(p1, "class", "svelte-irb86v");
      attr(p2, "class", "svelte-irb86v");
      attr(input0, "class", "searchInput svelte-irb86v");
      attr(input0, "type", "text");
      attr(input0, "name", "search");
      attr(input1, "type", "radio");
      attr(input1, "id", "search-front-choice");
      attr(input1, "name", "search-side-choice");
      input1.value = "front";
      attr(input1, "class", "svelte-irb86v");
      attr(label0, "for", "search-front-choice");
      attr(input2, "type", "radio");
      attr(input2, "id", "search-back-choice");
      attr(input2, "name", "search-side-choice");
      input2.value = "back";
      attr(input2, "class", "svelte-irb86v");
      attr(label1, "for", "search-back-choice");
      attr(input3, "type", "radio");
      attr(input3, "id", "search-tag-choice");
      attr(input3, "name", "search-side-choice");
      input3.value = "tags";
      attr(label2, "for", "search-tag-choice");
      attr(div, "class", "svelte-irb86v");
      attr(button1, "class", "svelte-irb86v");
      attr(header, "class", header_class_value = "options-panel " + /*showOptionsPanel*/
      (ctx[7] ? "options-panel-on" : "options-panel-off") + " svelte-irb86v");
    },
    m(target, anchor) {
      insert(target, button0, anchor);
      insert(target, t0, anchor);
      insert(target, header, anchor);
      append(header, p0);
      append(header, t2);
      append(header, select);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(select, null);
      }
      select_option(
        select,
        /*selected*/
        ctx[0]
      );
      append(header, t3);
      append(header, p1);
      append(header, t5);
      append(header, p2);
      append(header, t7);
      append(header, input0);
      append(header, t8);
      if (if_block0)
        if_block0.m(header, null);
      append(header, t9);
      append(header, div);
      append(div, input1);
      append(div, t10);
      append(div, label0);
      append(div, t12);
      append(div, input2);
      append(div, t13);
      append(div, label1);
      append(div, t15);
      append(div, input3);
      append(div, t16);
      append(div, label2);
      append(header, t18);
      append(header, button1);
      append(header, t20);
      if (if_block1)
        if_block1.m(header, null);
      insert(target, t21, anchor);
      insert(target, main, anchor);
      append(main, h1);
      append(main, t23);
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].m(main, null);
      }
      append(main, t24);
      append(main, br);
      current = true;
      if (!mounted) {
        dispose = [
          listen(
            window,
            "keydown",
            /*handleKeydown*/
            ctx[9]
          ),
          listen(
            window,
            "touchstart",
            /*touchstart*/
            ctx[17]
          ),
          listen(
            window,
            "touchend",
            /*touchend*/
            ctx[18]
          ),
          listen(
            button0,
            "click",
            /*toggleOptionsPanel*/
            ctx[10]
          ),
          listen(
            select,
            "change",
            /*select_change_handler*/
            ctx[20]
          ),
          listen(
            select,
            "change",
            /*onChange*/
            ctx[11]
          ),
          listen(
            input0,
            "input",
            /*onChangeSearch*/
            ctx[12]
          ),
          listen(
            input1,
            "change",
            /*onChangeSearch*/
            ctx[12]
          ),
          listen(
            input2,
            "change",
            /*onChangeSearch*/
            ctx[12]
          ),
          listen(
            input3,
            "change",
            /*onChangeSearch*/
            ctx[12]
          ),
          listen(
            button1,
            "click",
            /*shuffle*/
            ctx[13]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*datasets*/
      256) {
        each_value = /*datasets*/
        ctx2[8];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(select, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (dirty[0] & /*selected, datasets*/
      257) {
        select_option(
          select,
          /*selected*/
          ctx2[0]
        );
      }
      if (
        /*selected*/
        ctx2[0] === "chinese"
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_4(ctx2);
          if_block0.c();
          if_block0.m(header, t9);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (
        /*selected*/
        ctx2[0] === "chinese"
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_3(ctx2);
          if_block1.c();
          if_block1.m(header, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (!current || dirty[0] & /*showOptionsPanel*/
      128 && header_class_value !== (header_class_value = "options-panel " + /*showOptionsPanel*/
      (ctx2[7] ? "options-panel-on" : "options-panel-off") + " svelte-irb86v")) {
        attr(header, "class", header_class_value);
      }
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].p(select_block_ctx(ctx2, current_block_type_index), dirty);
        }
      } else {
        if (if_block2) {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
        }
        if (~current_block_type_index) {
          if_block2 = if_blocks[current_block_type_index];
          if (!if_block2) {
            if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](select_block_ctx(ctx2, current_block_type_index));
            if_block2.c();
          } else {
            if_block2.p(select_block_ctx(ctx2, current_block_type_index), dirty);
          }
          transition_in(if_block2, 1);
          if_block2.m(main, t24);
        } else {
          if_block2 = null;
        }
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block2);
      current = true;
    },
    o(local) {
      transition_out(if_block2);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(button0);
      if (detaching)
        detach(t0);
      if (detaching)
        detach(header);
      destroy_each(each_blocks, detaching);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      if (detaching)
        detach(t21);
      if (detaching)
        detach(main);
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].d();
      }
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let datasets = ["bopomofo", "chinese", "japanese", "cantonese"];
  let selected = "chinese";
  let currMode = "flashcard";
  let data = [];
  let filteredData = [];
  let currCardIndex = 0;
  let totalCards = data.length;
  const worker = new Worker("hanzi_lookup_worker.js");
  worker.onmessage = (e) => {
    if (!e.data.what)
      return;
    if (e.data.what == "lookup") {
      openResults(e.data.matches);
    }
  };
  worker.postMessage({ wasm_uri: "hanzi_lookup_bg.wasm" });
  const drawingCanvas = new DrawingCanvas(worker);
  let touchStartX;
  let navComponent;
  let cardComponent;
  function handleKeydown(evt) {
    const target = evt.target;
    if (evt.code === "ArrowLeft") {
      if (navComponent)
        navComponent.prev();
    } else if (evt.code === "ArrowRight") {
      if (navComponent)
        navComponent.next();
    } else if (evt.code === "Space") {
      if (target.name !== "search") {
        evt.preventDefault();
        if (cardComponent)
          cardComponent.flip();
      }
    }
  }
  onMount(async () => {
    const mapper = new Mapper();
    const res = await fetch("datasets/chinese.json");
    const d = await res.json();
    data = mapper.processChineseDataset(d);
    $$invalidate(2, filteredData = data);
    $$invalidate(4, totalCards = data.length);
  });
  let showOptionsPanel = false;
  const toggleOptionsPanel = () => {
    $$invalidate(7, showOptionsPanel = !showOptionsPanel);
  };
  const onChange = async () => {
    const mapper = new Mapper();
    const res = await fetch(`datasets/${selected}.json`);
    const d = await res.json();
    if (selected === "chinese") {
      data = mapper.processChineseDataset(d);
    } else if (selected === "japanese") {
      data = mapper.processJapaneseDataset(d);
    } else if (selected === "bopomofo") {
      data = mapper.processBopomofoDataset(d);
    } else if (selected === "cantonese") {
      data = mapper.processCantoneseDataset(d);
    }
    $$invalidate(3, currCardIndex = 0);
    $$invalidate(4, totalCards = data.length);
    $$invalidate(2, filteredData = data);
  };
  const onChangeSearch = async () => {
    const searchInput = document.querySelector(".searchInput");
    if (searchInput) {
      const inputVal = searchInput.value;
      if (inputVal !== "") {
        const selectedRadioBtn = document.querySelector('input[name="search-side-choice"]:checked');
        if (selectedRadioBtn) {
          const selectedSide = selectedRadioBtn.value;
          if (selectedSide === "back" && inputVal.split(" ").length > 1) {
            $$invalidate(2, filteredData = data.filter((x) => {
              var _a;
              const val = inputVal.split(" ").join("");
              const regex = x.pinyin.match(/[a-z]+/g).join("");
              return val === regex || ((_a = x[selectedSide]) == null ? void 0 : _a.includes(inputVal));
            }));
          } else {
            $$invalidate(2, filteredData = data.filter((x) => {
              var _a;
              return (_a = x[selectedSide]) == null ? void 0 : _a.includes(inputVal);
            }));
          }
        }
      } else {
        $$invalidate(2, filteredData = data);
      }
    }
    $$invalidate(3, currCardIndex = 0);
    $$invalidate(4, totalCards = filteredData.length);
  };
  const shuffle = () => {
    const maxIndex = filteredData.length - 1;
    for (let i = 0; i < filteredData.length - 2; i++) {
      const newIdx = Math.floor(Math.random() * (maxIndex - i) + i);
      const temp = filteredData[i];
      $$invalidate(2, filteredData[i] = filteredData[newIdx], filteredData);
      $$invalidate(2, filteredData[newIdx] = temp, filteredData);
    }
    const newCurrIdx = Math.floor(Math.random() * maxIndex);
    $$invalidate(3, currCardIndex = newCurrIdx);
  };
  const changeMode = (evt) => {
    const target = evt.target;
    if (currMode === "flashcard") {
      $$invalidate(1, currMode = "quiz");
      target.textContent = "flashcard mode";
      shuffle();
    } else {
      $$invalidate(1, currMode = "flashcard");
      target.textContent = "quiz mode";
    }
  };
  const getPossibleQuizAnswers = (correctAnswerIndex) => {
    const possibleAnswers = [
      filteredData[correctAnswerIndex],
      filteredData[Math.floor(Math.random() * totalCards)],
      filteredData[Math.floor(Math.random() * totalCards)]
    ];
    let counter = possibleAnswers.length;
    while (counter > 0) {
      const idx = Math.floor(Math.random() * counter);
      counter--;
      const tmp = possibleAnswers[counter];
      possibleAnswers[counter] = possibleAnswers[idx];
      possibleAnswers[idx] = tmp;
    }
    return possibleAnswers;
  };
  const checkQuizAnswer = (evt) => {
    const target = evt.target;
    const choice = target.textContent.trim();
    const actualAnswer = filteredData[currCardIndex].pinyin.trim();
    if (choice === actualAnswer) {
      target.style.border = "1px solid #32cd32";
      target.style.backgroundColor = "#32cd32";
    } else {
      target.style.border = "1px solid #aa4a44";
      target.style.backgroundColor = "#aa4a44";
    }
    setTimeout(
      () => {
        target.style.border = "1px solid #000";
        target.style.backgroundColor = "#fff";
      },
      2e3
    );
  };
  const touchstart = (evt) => {
    touchStartX = evt.touches[0].screenX;
  };
  const touchend = (evt) => {
    const end = evt.changedTouches[0].screenX;
    if (touchStartX && Math.abs(end - touchStartX) > 10) {
      if (end < touchStartX) {
        if (currCardIndex + 1 > totalCards - 1) {
          $$invalidate(3, currCardIndex = 0);
        } else {
          $$invalidate(3, currCardIndex++, currCardIndex);
        }
      } else {
        if (currCardIndex - 1 < 0) {
          $$invalidate(3, currCardIndex = totalCards - 1);
        } else {
          $$invalidate(3, currCardIndex--, currCardIndex);
        }
      }
    }
  };
  const openDrawingCanvas = () => {
    const overlay = document.createElement("div");
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.zIndex = "100";
    overlay.style.position = "absolute";
    overlay.style.left = "0";
    overlay.style.top = "0";
    overlay.style.backgroundColor = "rgba(128, 128, 128, 0.8)";
    overlay.style.textAlign = "center";
    const header = document.createElement("h1");
    header.textContent = "draw a character";
    const canvas = drawingCanvas.getCanvas();
    const submitBtn = document.createElement("button");
    submitBtn.textContent = "submit";
    submitBtn.addEventListener("click", () => {
      drawingCanvas.lookup();
      overlay.parentNode.removeChild(overlay);
    });
    const clearBtn = document.createElement("button");
    clearBtn.style.marginLeft = "6px";
    clearBtn.textContent = "clear";
    clearBtn.addEventListener("click", () => {
      drawingCanvas.drawClearCanvas();
    });
    const cancelBtn = document.createElement("button");
    cancelBtn.style.marginLeft = "6px";
    cancelBtn.textContent = "cancel";
    cancelBtn.addEventListener("click", () => {
      drawingCanvas.drawClearCanvas();
      overlay.parentNode.removeChild(overlay);
    });
    overlay.appendChild(header);
    overlay.appendChild(canvas);
    overlay.appendChild(document.createElement("br"));
    overlay.appendChild(submitBtn);
    overlay.appendChild(clearBtn);
    overlay.appendChild(cancelBtn);
    document.body.appendChild(overlay);
  };
  const openResults = (results) => {
    const overlay = document.createElement("div");
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.zIndex = "100";
    overlay.style.position = "absolute";
    overlay.style.left = "0";
    overlay.style.top = "0";
    overlay.style.backgroundColor = "rgba(128, 128, 128, 0.8)";
    overlay.style.textAlign = "center";
    const header = document.createElement("h1");
    header.textContent = "match results";
    const display = document.createElement("div");
    display.style.display = "flex";
    display.style.flexWrap = "wrap";
    display.style.alignItems = "center";
    display.style.justifyContent = "center";
    display.style.gap = "1em";
    display.style.margin = "0 auto";
    display.style.width = "auto";
    results.forEach((r) => {
      const resultElement = document.createElement("div");
      resultElement.style.padding = "5px";
      const hanzi = document.createElement("h1");
      hanzi.textContent = r.hanzi;
      hanzi.style.fontWeight = "bold";
      const matchScore = document.createElement("p");
      matchScore.textContent = `match score: ${r.score}`;
      resultElement.appendChild(hanzi);
      resultElement.appendChild(matchScore);
      resultElement.classList.add("match-result");
      resultElement.addEventListener("click", () => {
        const searchInput = document.querySelector(".searchInput");
        if (searchInput)
          searchInput.value = r.hanzi;
      });
      resultElement.style.backgroundColor = "#fff";
      display.appendChild(resultElement);
    });
    const cancelBtn = document.createElement("button");
    cancelBtn.style.marginLeft = "6px";
    cancelBtn.textContent = "cancel";
    cancelBtn.addEventListener("click", () => {
      overlay.parentNode.removeChild(overlay);
    });
    overlay.appendChild(header);
    overlay.appendChild(display);
    overlay.appendChild(document.createElement("br"));
    overlay.appendChild(cancelBtn);
    document.body.appendChild(overlay);
  };
  function select_change_handler() {
    selected = select_value(this);
    $$invalidate(0, selected);
    $$invalidate(8, datasets);
  }
  function counter_currCardIndex_binding(value) {
    currCardIndex = value;
    $$invalidate(3, currCardIndex);
  }
  function counter_totalCards_binding(value) {
    totalCards = value;
    $$invalidate(4, totalCards);
  }
  function card_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      cardComponent = $$value;
      $$invalidate(6, cardComponent);
    });
  }
  function navigate_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      navComponent = $$value;
      $$invalidate(5, navComponent);
    });
  }
  function navigate_currCardIndex_binding(value) {
    currCardIndex = value;
    $$invalidate(3, currCardIndex);
  }
  function navigate_totalCards_binding(value) {
    totalCards = value;
    $$invalidate(4, totalCards);
  }
  return [
    selected,
    currMode,
    filteredData,
    currCardIndex,
    totalCards,
    navComponent,
    cardComponent,
    showOptionsPanel,
    datasets,
    handleKeydown,
    toggleOptionsPanel,
    onChange,
    onChangeSearch,
    shuffle,
    changeMode,
    getPossibleQuizAnswers,
    checkQuizAnswer,
    touchstart,
    touchend,
    openDrawingCanvas,
    select_change_handler,
    counter_currCardIndex_binding,
    counter_totalCards_binding,
    card_binding,
    navigate_binding,
    navigate_currCardIndex_binding,
    navigate_totalCards_binding
  ];
}
class App extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);
  }
}
new App({
  target: document.getElementById("app")
});
