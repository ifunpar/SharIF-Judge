/**
 * SharIF Judge
 * @file shj_submit.js
 *
 *     Javascript codes for "Submit" page
 */

$(document).ready(function () {
	var editor = ace.edit("code_editor");

	editor.setOptions({
		theme: "ace/theme/monokai",
		fontSize: "11pt",
	});

	function disableEditor(bool) {
		$("#editor_save").prop("disabled", bool);
		$("#editor_execute").prop("disabled", bool);
		$("#editor_submit").prop("disabled", bool);
		$("#editor_input").prop("disabled", bool);
		editor.setReadOnly(bool);
	}

	function loadCode(problem_id) {
		$("#editor_input").val("");
		$("#editor_output").val("");

		if (problem_id == 0) {
			disableEditor(true);
			editor.setValue("");
			$("#ajax_status").html("Select problem and language");
		} else {
			disableEditor(true);
			$.ajax({
				url: shj.site_url + "submit/load/" + problem_id,
				cache: false,
				success: function (data) {
					data = JSON.parse(data);
					editor.setValue(data.content);
					recording.initMetrics();
					befText = data.content;
					$("#ajax_status").html(data.message);
				},
				error: function (error) {
					console.error(error);
				},
			});
		}
	}

	const canItBeDisabled = () => {
		if (!isRetrived) {
			isRetrived = true;
		} else {
			disableEditor(false);
		}
	};

	const loadBeforeRec = async (problem_id) => {
		const funcLoad = async (data) => {
			data = JSON.parse(data);

			if (data.content.trim() === "") {
				canItBeDisabled();
				return;
			}

			befRecording = await JSON.parse(data.content);
			canItBeDisabled();
		};

		if (problem_id == 0) {
			disableEditor(true);
			editor.setValue("");
		} else {
			disableEditor(true);
			await $.ajax({
				url: shj.site_url + "submit/load_rec/" + problem_id,
				cache: false,
				success: function (data) {
					funcLoad(data);
				},
				error: function (error) {
					console.error(error);
					canItBeDisabled();
				},
			});
		}
	};

	$("select#problems").change(function () {
		var v = $(this).val();
		loadCode(v);
		recordStart();
		loadBeforeRec(v);
		$("select#languages").empty();
		$(
			'<option value="0" selected="selected">-- Select Language --</option>'
		).appendTo("select#languages");
		for (var i = 0; i < shj.p[v].length; i++)
			$(
				'<option value="' + shj.p[v][i] + '">' + shj.p[v][i] + "</option>"
			).appendTo("select#languages");
	});

	$("select#languages").change(function () {
		if (this.value.toLowerCase().includes("java")) {
			editor.session.setMode("ace/mode/java");
		} else if (this.value.toLowerCase().includes("python")) {
			editor.session.setMode("ace/mode/python");
		} else if (this.value.toLowerCase().includes("c")) {
			editor.session.setMode("ace/mode/c_cpp");
		} else if (this.value.toLowerCase().includes("txt")) {
			editor.session.setMode("ace/mode/plain_text");
			$("#editor_execute").prop("disabled", true);
			$("#editor_input").prop("disabled", true);
		} else {
			editor.session.setMode("ace/mode/plain_text");
		}

		canItBeDisabled();
	});

	$("#editor_save").click(function () {
		disableEditor(true);
		handlers.save();

		$.ajax({
			type: "POST",
			url: shj.site_url + "submit/save",
			data: {
				shj_csrf_token: shj.csrf_token,
				code_editor: editor.getValue(),
				problem_id: $("select#problems").val(),
				language: $("select#languages").val(),
				rec_data: recording.stringify(),
				rec_metrics: recording.getCalcMetrics(),
			},
			cache: false,
			success: function (data) {
				data = JSON.parse(data);

				$("#ajax_status").html(data.message);
				disableEditor(false);
			},
			error: function (error) {
				console.error(error);
				disableEditor(false);
			},
		});
	});

	$("#editor_submit").click(function () {
		disableEditor(true);
		handlers.submit();

		$.ajax({
			type: "POST",
			url: shj.site_url + "submit/save/submit",
			data: {
				shj_csrf_token: shj.csrf_token,
				code_editor: editor.getValue(),
				problem_id: $("select#problems").val(),
				language: $("select#languages").val(),
				rec_data: recording.stringify(),
				rec_metrics: recording.getCalcMetrics(),
			},
			cache: false,
			success: function (data) {
				data = JSON.parse(data);
				$("#ajax_status").html(data.message);
				disableEditor(false);
				if (data.status) {
					window.location.href = shj.site_url + "submissions/all";
				}
			},
			error: function (error) {
				console.error(error);
				disableEditor(false);
			},
		});

		recordStop();
	});

	$("#editor_execute").click(function () {
		disableEditor(true);
		handlers.execute();

		const input = $("textarea#editor_input").val();

		$.ajax({
			type: "POST",
			url: shj.site_url + "submit/save/execute",
			data: {
				shj_csrf_token: shj.csrf_token,
				code_editor: editor.getValue(),
				editor_input: input,
				problem_id: $("select#problems").val(),
				language: $("select#languages").val(),
				rec_data: recording.stringify(),
				rec_metrics: recording.getCalcMetrics(),
			},
			cache: false,
			success: function (data) {
				data = JSON.parse(data);
				$("#ajax_status").html(data.message);
				if (data.status) {
					(function update() {
						$.ajax({
							url:
								shj.site_url +
								"submit/get_output/" +
								$("select#problems").val(),
							cache: false,
							success: function (data) {
								data = JSON.parse(data);
								$("textarea#editor_output").val(data.content);
								// ----
								$("textarea#editor_output").trigger("output_change", {
									value: data.content,
									input: input,
								});
								// ----
								if (!data.status) {
									setTimeout(update, 1000);
								} else {
									$("#ajax_status").html("Completed");
									disableEditor(false);
								}
							},
							error: function (error) {
								console.error(error);
								disableEditor(false);
							},
						});
					})();
				} else {
					disableEditor(false);
				}
			},
			error: function (error) {
				console.error(error);
				disableEditor(false);
			},
		});
	});

	loadCode($("select#problems").val());

	// ######################################################
	// ############          Recording           ############
	// ######################################################

	// Local Variable
	const Range = ace.Range;

	let hidden = "hidden";
	let visibilityChange = "visibilitychange";
	let isRetrived = false;

	// Saved Recording from before...
	let befRecording = {};
	let befText = "";

	// Saved Event
	const recording = {
		events: [],
		startTime: -1,
		endTime: -1,
		metrics: {
			inserted: 0, // total char inserted
			removed: 0, // total char removed
			total_input_change: 0,
			total_execute: 0,
			total_nav_in: 0,
			total_nav_out: 0,
			max_inserted: -1,
			max_removed: -1,
		},

		init: () => {
			recording.events = [];
			recording.startTime = Date.now();
			recording.initMetrics();
		},

		initMetrics: () => {
			recording.metrics = {
				inserted: 0,
				removed: 0,
				total_input_change: 0,
				total_execute: 0,
				total_nav_in: 0,
				total_nav_out: 0,
				max_inserted: -1,
				max_removed: -1,
			};
		},

		stringify: () => {
			return JSON.stringify({
				...befRecording,
				[recording.startTime]: {
					metrics: recording.getCalcMetrics(),
					events: recording.events,
				},
			});
		},

		getCalcMetrics: () => {
			// console.log(befRecording);
			const bef = undefined;
			if (befRecording.length > 0)
				bef =
					befRecording[
						Object.keys(befRecording)[Object.keys(befRecording).length - 1]
					].metrics;

			return calcMetrics(recording.metrics, bef, recording);
		},
	};

	// What's recording does the system will record
	// key function that will run in "record" class
	const include = {
		editor: true,
		web: true,
		pdf: true,
		input: true,
		output: true,
		// action: true, // always true
		others: false, // default value for other recording
	};

	// ######################################################
	// ############           Listener            ###########
	// ######################################################

	// handlers for recording
	const handlers = {
		// ######### Editor Event #########
		// Detected Every Command that executed in editor
		editor_change: (e) => {
			const time = getCurrentTime();
			const payload = {
				data: e.lines,
				start: e.start,
				end: e.end,
			};

			recordEvent(e.action, time, payload);
			metricHandlers[e.action](payload, time);
		},
		// Detected on cursor change
		editor_cursor: () => {
			const time = getCurrentTime();
			const change = getSelection(editor);
			recordEvent("cursor_selection", time, change);
			metricHandlers["editor_cursor"](change, time);
		},
		// Detected on selection
		editor_selection: () => {
			const time = getCurrentTime();
			const change = getSelection(editor);
			recordEvent("sel_selection", time, change);
			metricHandlers["editor_selection"](change, time);
		},

		// ######### Windows Event #########
		// Detected Leaving Focus in almost all browser (still active page, but on different windows or on iFrame PDF viewer)
		focus: () => {
			const time = getCurrentTime();
			removeListener.focus();
			addListener.blur();

			recordEvent("focus", time);
			metricHandlers["focus"](true, time);
		},
		// Detected on Focus in almost all browser (active page)
		blur: () => {
			const time = getCurrentTime();
			removeListener.blur();
			addListener.focus();

			recordEvent("blur", time);
			metricHandlers["blur"](true, time);
		},
		// Detected Leaving Page in almost all browser (page not visible anymore)
		visibility: (evt) => {
			const time = getCurrentTime();
			let v = true; // page is visible
			let h = false; // ppage is hidden

			let evtMap = {
				focus: v,
				focusin: v,
				pageshow: v,
				blur: h,
				focusout: h,
				pagehide: h,
			};

			let isVisible = true;

			evt = evt || window.event;

			if (evt.type in evtMap) isVisible = evtMap[evt.type];
			else isVisible = document[hidden] ? h : v;

			if (isVisible) {
				// detect focus or blur if visible again
				addListener.focus();
				addListener.pdf_focus();
			} else {
				// no need to detect focus or blur if not visible
				removeListener.focus();
				removeListener.blur();
				removeListener.pdf_focus();
				removeListener.pdf_blur();
			}

			recordEvent("visibility", time, isVisible);
			metricHandlers["visibility"](isVisible, time);
		},

		// ######### PDF Viewer ##########
		// Detected when user click/focus on the pdf viewer IDE
		pdf_focus: () => {
			const time = getCurrentTime();
			removeListener.pdf_focus();
			addListener.pdf_blur();

			recordEvent("pdf_focus", time);
			metricHandlers["pdf_focus"](true, time);
		},
		// Detected when user click outside/blur of the pdf viewer IDE
		pdf_blur: () => {
			const time = getCurrentTime();
			removeListener.pdf_blur();
			addListener.pdf_focus();

			recordEvent("pdf_blur", time);
			metricHandlers["pdf_blur"](true, time);
		},

		// ######### Input Event #########
		input_change: (e) => {
			const time = getCurrentTime();
			recordEvent("input_change", time, e.currentTarget.value);
			metricHandlers["input_change"](e.currentTarget.value, time);
		},

		// ######### Output Event #########
		output_change: (_, { value, input }) => {
			const time = getCurrentTime();
			recordEvent("output_change", time, value);
			metricHandlers["output_change"](
				{
					value,
					input,
				},
				time
			);
		},

		// ######### Action Event #########
		save: () => {
			const time = getCurrentTime();
			recordEvent("save", time);
			metricHandlers["save"](true, time);
		},
		submit: () => {
			const time = getCurrentTime();
			recordEvent("submit", time);
			metricHandlers["submit"](true, time);
		},
		execute: () => {
			const time = getCurrentTime();
			recordEvent("execute", time);
			metricHandlers["execute"](true, time);
		},
	};

	const addListener = {
		editor_change: () => editor.session.on("change", handlers.editor_change),
		editor_cursor: () =>
			editor.session.selection.on("changeCursor", handlers.editor_cursor),
		editor_selection: () =>
			editor.session.selection.on("changeSelection", handlers.editor_selection),
		focus: () => addEvent(window, "focus", handlers.focus),
		blur: () => addEvent(window, "blur", handlers.blur),
		visibility: () => addEvent(document, visibilityChange, handlers.visibility),
		pdf_focus: () =>
			addEvent(
				$("#pdf_viewer")[0].contentWindow,
				"focusin",
				handlers.pdf_focus
			),
		pdf_blur: () =>
			addEvent(
				$("#pdf_viewer")[0].contentWindow,
				"focusout",
				handlers.pdf_blur
			),
		input_change: () => $("#editor_input").on("input", handlers.input_change),
		output_change: () =>
			$("textarea#editor_output").on("output_change", handlers.output_change),
	};

	const removeListener = {
		editor_change: () =>
			editor.commands.off("afterExec", handlers.editor_change),
		editor_cursor: () =>
			editor.selection.off("changeCursor", handlers.editor_cursor),
		editor_selection: () =>
			editor.selection.off("changeSelection", handlers.editor_selection),
		focus: () => removeEvent(window, "focus", handlers.focus),
		blur: () => removeEvent(window, "blur", handlers.blur),
		visibility: () =>
			removeEvent(document, visibilityChange, handlers.visibility),
		pdf_focus: () =>
			removeEvent(
				$("#pdf_viewer")[0].contentWindow,
				"focusin",
				handlers.pdf_focus
			),
		pdf_blur: () =>
			removeEvent(
				$("#pdf_viewer")[0].contentWindow,
				"focusout",
				handlers.pdf_blur
			),
		input_change: () => $("#editor_input").off("input", handlers.input_change),
		output_change: () =>
			$("textarea#editor_output").off("output_change", handlers.output_change),
	};

	// ######################################################
	// ############           Methods            ############
	// ######################################################

	const record = {
		// Code Editor
		editor: () => {
			// Exec command
			addListener.editor_change();

			// For Cursor
			addListener.editor_cursor();
			addListener.editor_selection();
		},
		// Overall page/tabs
		web: () => {
			// ####### Web Page #######

			// for every type of browser.
			if (hidden in document) {
				visibilityChange = "visibilitychange";
			} else if ((hidden = "mozHidden") in document) {
				visibilityChange = "mozvisibilitychange";
			} else if ((hidden = "webkitHidden") in document) {
				visibilityChange = "webkitvisibilitychange";
			} else if ((hidden = "msHidden") in document) {
				visibilityChange = "msvisibilitychange";
			}

			if (visibilityChange != null) {
				// addListener.focus();
				addListener.blur();
				addListener.visibility();
			} else if ("onfocusin" in document) {
				// IE 9 and lower:
				document.onfocusin = document.onfocusout = handlers.visibility;
			} else {
				// All others:
				window.onpageshow =
					window.onpagehide =
					window.onfocus =
					window.onblur =
						handlers.visibility;
			}
		},
		// PDF Viewer
		pdf: () => {
			let el = document.getElementById("pdf_viewer");

			var observer = new IntersectionObserver(function () {
				if (el.src != "") {
					// addListener.pdf_blur();
					addListener.pdf_focus();
				}
			});

			observer.observe(el, { attributes: true, childList: true });
		},
		// Input field
		input: () => {
			addListener.input_change();
		},
		// Output field
		output: () => {
			addListener.output_change();
		},
		// Action Button added in the onclick event listener.
	};

	// Methods to start recording.
	const recordStart = () => {
		recording.init();

		Object.keys(record).forEach((evtName) => {
			const inInclude = evtName in include;
			if (include[evtName] || (!inInclude && include["others"])) {
				record[evtName]();
			}
		});
	};

	const recordStop = () => {
		Object.values(removeListener).forEach((func) => {
			func();
		});
	};

	// ######################################################
	// ############            Misc             #############
	// ######################################################

	// Method to record listener.
	const recordEvent = (event, time, args) => {
		recording.events.push({
			time: time,
			event,
			args,
		});
	};

	const addEvent = (obj, evType, fn, isCapturing) => {
		if (isCapturing == null) isCapturing = false;
		if (obj.addEventListener) {
			// Firefox
			obj.addEventListener(evType, fn, isCapturing);
			return true;
		} else if (obj.attachEvent) {
			// MSIE
			var r = obj.attachEvent("on" + evType, fn);
			return r;
		} else {
			return false;
		}
	};

	const removeEvent = (obj, evType, fn, isCapturing) => {
		if (isCapturing == null) isCapturing = false;
		if (obj.removeEventListener) {
			// Firefox
			obj.removeEventListener(evType, fn, isCapturing);
			return true;
		} else if (obj.detachEvent) {
			// MSIE
			var r = obj.detachEvent("on" + evType, fn);
			return r;
		} else {
			return false;
		}
	};

	const getSelection = (editor) => {
		var data = editor.multiSelect.toJSON();
		if (!data.length) data = [data];
		data = data.map(function (x) {
			var a, c;
			if (x.isBackwards) {
				a = x.end;
				c = x.start;
			} else {
				c = x.end;
				a = x.start;
			}
			return Range.comparePoints(a, c)
				? [a.row, a.column, c.row, c.column]
				: [a.row, a.column];
		});
		return data.length > 1 ? data : data[0];
	};

	const getCurrentTime = () => {
		return Date.now() - recording.startTime;
	};

	// + REVISI CODE

	// handlers for metrics only
	const metricHandlers = {
		insert: (e, time) => {
			const total = e.data.join("\n").length;

			recording.metrics.inserted += total;
			recording.metrics.max_inserted = Math.max(
				total,
				recording.metrics.max_inserted
			);
		},
		remove: (e, time) => {
			const total = e.data.join("\n").length;
			recording.metrics.removed += total;
			recording.metrics.max_removed = Math.max(
				total,
				recording.metrics.max_removed
			);
		},
		editor_cursor: (selection, time) => {},
		editor_selection: (selection, time) => {},
		focus: (_, time) => {
			recording.metrics.total_nav_in++;
		},
		blur: (_, time) => {
			recording.metrics.total_nav_out++;
		},
		visibility: (isVisible, time) => {
			if (isVisible) recording.metrics.total_nav_in++;
			else recording.metrics.total_nav_out++;
		},
		pdf_focus: (_, time) => {
			recording.metrics.total_nav_in--;
			recording.metrics.total_nav_out--;
		},
		pdf_blur: (_, time) => {},
		input_change: (value, time) => {
			recording.metrics.total_input_change++;
		},
		output_change: ({ value, input }, time) => {},
		save: (_, time) => {
			recording.endTime = time;
		},
		submit: (_, time) => {
			recording.endTime = time;
		},
		execute: (_, time) => {
			recording.metrics.total_execute++;
			recording.endTime = time;
		},
	};

	const calcMetrics = (
		metrics = recording.metrics,
		before = {
			origin: {
				inserted: 0,
				removed: 0,
			},
			debugging: {
				input_change: 0,
				execute: 0,
			},
			navigation: {
				total_in: 0,
				total_out: 0,
			},
			copyPaste: {
				max_inserted: 0,
				max_removed: 0,
			},
			duration: 0,
		},
		rec = recording
	) => {
		const diffText = Diff.diffChars(befText, editor.getValue()).reduce(
			(prev, cur) => {
				if (!cur.added && !cur.removed) return prev;
				return prev + cur.count;
			},
			0
		);

		return {
			origin: metrics,
			duration: before.duration + rec.endTime,
			// Jadi code churn rate or cct = (inserted + removed) / total_char_submit_code
			// for every recording, find the latest submission (if exists)
			// and get the char diff using jsdiff, to get total_char_submit_code
			// cct can be scored with the average for the problem
			cct: {
				score:
					(metrics.inserted +
						metrics.removed +
						before.origin.inserted +
						before.origin.removed) /
					((before.origin.inserted > 0 || before.origin.removed > 0)
						? editor.getValue().length
						: diffText),
			},
			debugging: {
				input_change: before.debugging.input_change + metrics.total_input_change,
				execute: before.debugging.execute + metrics.total_execute,
			},
			navigation: {
				total_in: before.navigation.total_in + metrics.total_nav_in,
				total_out: before.navigation.total_out + metrics.total_nav_out,
			},
			copyPaste: {
				max_inserted: Math.max(before.copyPaste.max_inserted, metrics.max_inserted),
				max_removed: Math.max(before.copyPaste.max_removed, metrics.max_removed),
			},
		};
	};
});
