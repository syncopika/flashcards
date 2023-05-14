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
function create_if_block_1(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      attr(div, "class", "front svelte-3vogdr");
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
  return {
    c() {
      div = element("div");
      attr(div, "class", "back svelte-3vogdr");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      div.innerHTML = /*backData*/
      ctx[2];
    },
    p(ctx2, dirty) {
      if (dirty & /*backData*/
      4)
        div.innerHTML = /*backData*/
        ctx2[2];
    },
    d(detaching) {
      if (detaching)
        detach(div);
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
    ctx[3] && create_if_block_1(ctx)
  );
  let if_block1 = !/*front*/
  ctx[3] && create_if_block$1(ctx);
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
        ctx[3] ? "cardInner" : "cardInnerFlipped"
      ) + " svelte-3vogdr");
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
        ctx2[3]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_1(ctx2);
          if_block0.c();
          if_block0.m(div, t);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (!/*front*/
      ctx2[3]) {
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
      8 && div_class_value !== (div_class_value = null_to_empty(
        /*front*/
        ctx2[3] ? "cardInner" : "cardInnerFlipped"
      ) + " svelte-3vogdr")) {
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
    $$invalidate(3, front = !front);
  };
  let { frontData = "front of card" } = $$props;
  let { backData = "back of card" } = $$props;
  $$self.$$set = ($$props2) => {
    if ("frontData" in $$props2)
      $$invalidate(1, frontData = $$props2.frontData);
    if ("backData" in $$props2)
      $$invalidate(2, backData = $$props2.backData);
  };
  return [flip, frontData, backData, front];
}
class Card extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, { flip: 0, frontData: 1, backData: 2 });
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
      attr(p0, "class", "svelte-1s3hj9f");
      attr(p1, "class", "svelte-1s3hj9f");
      attr(p2, "class", "svelte-1s3hj9f");
      attr(div, "class", "counter svelte-1s3hj9f");
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
      attr(button0, "class", "svelte-1d2e7k");
      attr(button1, "class", "svelte-1d2e7k");
      attr(div, "class", "navigate svelte-1d2e7k");
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
  // to be arranged like an array of {"value": "匂", "pinyin": "xiong1", "definition": "fragrance, smell;"}
  // we want to show the character on the front of a card and the pinyin and definition on the back of the card
  // TODO: create an interface for the expected incoming dataset format
  // TODO: maybe pass back the fields and values to display and let whoever is receiving this data handle the html presentation
  processChineseDataset(jsonData) {
    return jsonData.map((obj) => {
      return {
        front: obj.value,
        back: `<p><span class='field'>pinyin:</span> ${obj.pinyin}</p> <p><span class='field'>definition:</span> ${obj.definition}</p>`
      };
    });
  }
  // example data: {"value": "暗記", "romaji": "anki (あんき)", "definition": "memorization"}
  processJapaneseDataset(jsonData) {
    return jsonData.map((obj) => {
      return {
        front: obj.value,
        back: `<p><span class='field'>romaji:</span> ${obj.romaji}</p> <p><span class='field'>definition:</span> ${obj.definition}</p>`
      };
    });
  }
  // example data: {"character": "ㄅ", "pinyin": "b"}
  processBopomofoDataset(jsonData) {
    return jsonData.map((obj) => {
      return {
        front: obj.character,
        back: `<p><span class='field'>pinyin:</span> ${obj.pinyin}</p>`
      };
    });
  }
}
const App_svelte_svelte_type_style_lang = "";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[21] = list[i];
  return child_ctx;
}
function create_each_block(ctx) {
  let option;
  let t_value = (
    /*ds*/
    ctx[21] + ""
  );
  let t;
  return {
    c() {
      option = element("option");
      t = text(t_value);
      option.__value = /*ds*/
      ctx[21];
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
function create_if_block(ctx) {
  let card;
  let current;
  let card_props = {
    frontData: (
      /*filteredData*/
      ctx[1][
        /*currCardIndex*/
        ctx[2]
      ].front
    ),
    backData: (
      /*filteredData*/
      ctx[1][
        /*currCardIndex*/
        ctx[2]
      ].back
    )
  };
  card = new Card({ props: card_props });
  ctx[16](card);
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
      if (dirty & /*filteredData, currCardIndex*/
      6)
        card_changes.frontData = /*filteredData*/
        ctx2[1][
          /*currCardIndex*/
          ctx2[2]
        ].front;
      if (dirty & /*filteredData, currCardIndex*/
      6)
        card_changes.backData = /*filteredData*/
        ctx2[1][
          /*currCardIndex*/
          ctx2[2]
        ].back;
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
      ctx[16](null);
      destroy_component(card, detaching);
    }
  };
}
function create_fragment(ctx) {
  let button0;
  let t0;
  let main;
  let div0;
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
  let input1;
  let t9;
  let label0;
  let t11;
  let input2;
  let t12;
  let label1;
  let t14;
  let button1;
  let div0_class_value;
  let t16;
  let h1;
  let t18;
  let counter;
  let updating_currCardIndex;
  let updating_totalCards;
  let t19;
  let div1;
  let t20;
  let br;
  let t21;
  let navigate;
  let updating_currCardIndex_1;
  let updating_totalCards_1;
  let current;
  let mounted;
  let dispose;
  let each_value = (
    /*datasets*/
    ctx[7]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  function counter_currCardIndex_binding(value) {
    ctx[14](value);
  }
  function counter_totalCards_binding(value) {
    ctx[15](value);
  }
  let counter_props = {};
  if (
    /*currCardIndex*/
    ctx[2] !== void 0
  ) {
    counter_props.currCardIndex = /*currCardIndex*/
    ctx[2];
  }
  if (
    /*totalCards*/
    ctx[3] !== void 0
  ) {
    counter_props.totalCards = /*totalCards*/
    ctx[3];
  }
  counter = new Counter({ props: counter_props });
  binding_callbacks.push(() => bind(counter, "currCardIndex", counter_currCardIndex_binding));
  binding_callbacks.push(() => bind(counter, "totalCards", counter_totalCards_binding));
  let if_block = (
    /*totalCards*/
    ctx[3] > 0 && create_if_block(ctx)
  );
  function navigate_currCardIndex_binding(value) {
    ctx[18](value);
  }
  function navigate_totalCards_binding(value) {
    ctx[19](value);
  }
  let navigate_props = {};
  if (
    /*currCardIndex*/
    ctx[2] !== void 0
  ) {
    navigate_props.currCardIndex = /*currCardIndex*/
    ctx[2];
  }
  if (
    /*totalCards*/
    ctx[3] !== void 0
  ) {
    navigate_props.totalCards = /*totalCards*/
    ctx[3];
  }
  navigate = new Navigate({ props: navigate_props });
  ctx[17](navigate);
  binding_callbacks.push(() => bind(navigate, "currCardIndex", navigate_currCardIndex_binding));
  binding_callbacks.push(() => bind(navigate, "totalCards", navigate_totalCards_binding));
  return {
    c() {
      button0 = element("button");
      button0.innerHTML = `<i class="fa fa-bars"></i>`;
      t0 = space();
      main = element("main");
      div0 = element("div");
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
      input1 = element("input");
      t9 = space();
      label0 = element("label");
      label0.textContent = "front";
      t11 = space();
      input2 = element("input");
      t12 = space();
      label1 = element("label");
      label1.textContent = "back";
      t14 = space();
      button1 = element("button");
      button1.textContent = "shuffle";
      t16 = space();
      h1 = element("h1");
      h1.textContent = "flashcards";
      t18 = space();
      create_component(counter.$$.fragment);
      t19 = space();
      div1 = element("div");
      if (if_block)
        if_block.c();
      t20 = space();
      br = element("br");
      t21 = space();
      create_component(navigate.$$.fragment);
      attr(button0, "class", "icon svelte-ar9qk4");
      attr(p0, "class", "svelte-ar9qk4");
      attr(select, "class", "svelte-ar9qk4");
      if (
        /*selected*/
        ctx[0] === void 0
      )
        add_render_callback(() => (
          /*select_change_handler*/
          ctx[13].call(select)
        ));
      attr(p1, "class", "svelte-ar9qk4");
      attr(p2, "class", "svelte-ar9qk4");
      attr(input0, "class", "searchInput svelte-ar9qk4");
      attr(input0, "type", "text");
      attr(input0, "name", "search");
      attr(input1, "type", "radio");
      attr(input1, "id", "search-front-choice");
      attr(input1, "name", "search-side-choice");
      input1.value = "front";
      attr(input1, "class", "svelte-ar9qk4");
      attr(label0, "for", "search-front-choice");
      attr(label0, "class", "svelte-ar9qk4");
      attr(input2, "type", "radio");
      attr(input2, "id", "search-back-choice");
      attr(input2, "name", "search-side-choice");
      input2.value = "back";
      attr(input2, "class", "svelte-ar9qk4");
      attr(label1, "for", "search-back-choice");
      attr(label1, "class", "svelte-ar9qk4");
      attr(button1, "class", "svelte-ar9qk4");
      attr(div0, "class", div0_class_value = "options-panel " + /*showOptionsPanel*/
      (ctx[6] ? "options-panel-on" : "options-panel-off") + " svelte-ar9qk4");
      attr(div1, "class", "cardContainer svelte-ar9qk4");
    },
    m(target, anchor) {
      insert(target, button0, anchor);
      insert(target, t0, anchor);
      insert(target, main, anchor);
      append(main, div0);
      append(div0, p0);
      append(div0, t2);
      append(div0, select);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(select, null);
      }
      select_option(
        select,
        /*selected*/
        ctx[0]
      );
      append(div0, t3);
      append(div0, p1);
      append(div0, t5);
      append(div0, p2);
      append(div0, t7);
      append(div0, input0);
      append(div0, t8);
      append(div0, input1);
      append(div0, t9);
      append(div0, label0);
      append(div0, t11);
      append(div0, input2);
      append(div0, t12);
      append(div0, label1);
      append(div0, t14);
      append(div0, button1);
      append(main, t16);
      append(main, h1);
      append(main, t18);
      mount_component(counter, main, null);
      append(main, t19);
      append(main, div1);
      if (if_block)
        if_block.m(div1, null);
      append(main, t20);
      append(main, br);
      append(main, t21);
      mount_component(navigate, main, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(
            window,
            "keydown",
            /*handleKeydown*/
            ctx[8]
          ),
          listen(
            button0,
            "click",
            /*toggleOptionsPanel*/
            ctx[9]
          ),
          listen(
            select,
            "change",
            /*select_change_handler*/
            ctx[13]
          ),
          listen(
            select,
            "change",
            /*onChange*/
            ctx[10]
          ),
          listen(
            input0,
            "input",
            /*onChangeSearch*/
            ctx[11]
          ),
          listen(
            input1,
            "change",
            /*onChangeSearch*/
            ctx[11]
          ),
          listen(
            input2,
            "change",
            /*onChangeSearch*/
            ctx[11]
          ),
          listen(
            button1,
            "click",
            /*shuffle*/
            ctx[12]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*datasets*/
      128) {
        each_value = /*datasets*/
        ctx2[7];
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
      if (dirty & /*selected, datasets*/
      129) {
        select_option(
          select,
          /*selected*/
          ctx2[0]
        );
      }
      if (!current || dirty & /*showOptionsPanel*/
      64 && div0_class_value !== (div0_class_value = "options-panel " + /*showOptionsPanel*/
      (ctx2[6] ? "options-panel-on" : "options-panel-off") + " svelte-ar9qk4")) {
        attr(div0, "class", div0_class_value);
      }
      const counter_changes = {};
      if (!updating_currCardIndex && dirty & /*currCardIndex*/
      4) {
        updating_currCardIndex = true;
        counter_changes.currCardIndex = /*currCardIndex*/
        ctx2[2];
        add_flush_callback(() => updating_currCardIndex = false);
      }
      if (!updating_totalCards && dirty & /*totalCards*/
      8) {
        updating_totalCards = true;
        counter_changes.totalCards = /*totalCards*/
        ctx2[3];
        add_flush_callback(() => updating_totalCards = false);
      }
      counter.$set(counter_changes);
      if (
        /*totalCards*/
        ctx2[3] > 0
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*totalCards*/
          8) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(div1, null);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
      const navigate_changes = {};
      if (!updating_currCardIndex_1 && dirty & /*currCardIndex*/
      4) {
        updating_currCardIndex_1 = true;
        navigate_changes.currCardIndex = /*currCardIndex*/
        ctx2[2];
        add_flush_callback(() => updating_currCardIndex_1 = false);
      }
      if (!updating_totalCards_1 && dirty & /*totalCards*/
      8) {
        updating_totalCards_1 = true;
        navigate_changes.totalCards = /*totalCards*/
        ctx2[3];
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
      if (detaching)
        detach(button0);
      if (detaching)
        detach(t0);
      if (detaching)
        detach(main);
      destroy_each(each_blocks, detaching);
      destroy_component(counter);
      if (if_block)
        if_block.d();
      ctx[17](null);
      destroy_component(navigate);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let datasets = ["bopomofo", "chinese", "japanese"];
  let selected = "chinese";
  let data = [];
  let filteredData = [];
  let currCardIndex = 0;
  let totalCards = data.length;
  let navComponent;
  let cardComponent;
  function handleKeydown(evt) {
    if (evt.code === "ArrowLeft") {
      if (navComponent)
        navComponent.prev();
    } else if (evt.code === "ArrowRight") {
      if (navComponent)
        navComponent.next();
    } else if (evt.code === "Space") {
      if (cardComponent)
        cardComponent.flip();
    }
  }
  onMount(async () => {
    const mapper = new Mapper();
    const res = await fetch("datasets/chinese.json");
    const d = await res.json();
    data = mapper.processChineseDataset(d);
    $$invalidate(1, filteredData = data);
    $$invalidate(3, totalCards = data.length);
  });
  let showOptionsPanel = false;
  const toggleOptionsPanel = () => {
    $$invalidate(6, showOptionsPanel = !showOptionsPanel);
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
    }
    $$invalidate(2, currCardIndex = 0);
    $$invalidate(3, totalCards = data.length);
    $$invalidate(1, filteredData = data);
  };
  const onChangeSearch = async () => {
    const searchInput = document.querySelector(".searchInput");
    if (searchInput) {
      const inputVal = searchInput.value;
      if (inputVal !== "") {
        const selectedRadioBtn = document.querySelector('input[name="search-side-choice"]:checked');
        if (selectedRadioBtn) {
          const selectedSide = selectedRadioBtn.value;
          $$invalidate(1, filteredData = data.filter((x) => x[selectedSide].includes(inputVal)));
        }
      } else {
        $$invalidate(1, filteredData = data);
      }
    }
    $$invalidate(2, currCardIndex = 0);
    $$invalidate(3, totalCards = filteredData.length);
  };
  const shuffle = () => {
    const maxIndex = filteredData.length - 1;
    for (let i = 0; i < filteredData.length - 2; i++) {
      const newIdx = Math.floor(Math.random() * (maxIndex - i) + i);
      const temp = filteredData[i];
      $$invalidate(1, filteredData[i] = filteredData[newIdx], filteredData);
      $$invalidate(1, filteredData[newIdx] = temp, filteredData);
    }
    const newCurrIdx = Math.floor(Math.random() * maxIndex);
    $$invalidate(2, currCardIndex = newCurrIdx);
  };
  function select_change_handler() {
    selected = select_value(this);
    $$invalidate(0, selected);
    $$invalidate(7, datasets);
  }
  function counter_currCardIndex_binding(value) {
    currCardIndex = value;
    $$invalidate(2, currCardIndex);
  }
  function counter_totalCards_binding(value) {
    totalCards = value;
    $$invalidate(3, totalCards);
  }
  function card_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      cardComponent = $$value;
      $$invalidate(5, cardComponent);
    });
  }
  function navigate_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      navComponent = $$value;
      $$invalidate(4, navComponent);
    });
  }
  function navigate_currCardIndex_binding(value) {
    currCardIndex = value;
    $$invalidate(2, currCardIndex);
  }
  function navigate_totalCards_binding(value) {
    totalCards = value;
    $$invalidate(3, totalCards);
  }
  return [
    selected,
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
    init(this, options, instance, create_fragment, safe_not_equal, {});
  }
}
new App({
  target: document.getElementById("app")
});
