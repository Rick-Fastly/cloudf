import React, { useState, useCallback, useMemo } from 'react';
import { RefreshCcw, Zap, Link, Clock, Lock, Menu, ChevronsRight, Copy, Code, Lightbulb } from 'lucide-react';

// Utility function for copying text to clipboard in a sandbox environment
const copyToClipboard = (text) => {
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  try {
    document.execCommand('copy');
    console.log('Content copied to clipboard.');
    return true;
  } catch (err) {
    console.error('Could not copy text: ', err);
    return false;
  } finally {
    document.body.removeChild(el);
  }
};

const Header = () => (
  <header className="p-4 bg-gray-900 shadow-lg text-white rounded-t-xl">
    <h1 className="text-3xl font-extrabold flex items-center">
      <Zap className="w-8 h-8 mr-3 text-indigo-400" />
      CDN Config Translator
    </h1>
    <p className="mt-1 text-sm text-gray-400">
      Map common Cloudflare Page Rules to Fastly CLI/VCL logic.
    </p>
  </header>
);

const CloudflareRuleInput = ({ rule, setRule }) => {
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setRule(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, [setRule]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center">
        <Menu className="w-5 h-5 mr-2 text-indigo-500" />
        Cloudflare Page Rule Definition
      </h2>

      {/* URL Pattern Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          1. URL Pattern (e.g., `*example.com/assets/*`)
        </label>
        <input
          type="text"
          name="url_pattern"
          value={rule.url_pattern}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
          placeholder="*example.com/path/*"
        />
        <p className="text-xs text-gray-500 mt-1">Wildcards (`*`) are recommended.</p>
      </div>

      {/* Action Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          2. Action Type
        </label>
        <select
          name="action_type"
          value={rule.action_type}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="cache">Caching/TTL Override</option>
          <option value="redirect">Forwarding URL (Redirect)</option>
          <option value="security">Security Headers (HSTS/CORS)</option>
          <option value="rewrite">URL Path Rewrite & Capture</option>
        </select>
      </div>

      {/* Conditional Inputs based on Action Type */}
      {rule.action_type === 'cache' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Clock className="w-4 h-4 mr-1 text-green-600" />
            Edge Cache TTL (Fastly Default TTL)
          </label>
          <input
            type="text"
            name="cache_ttl"
            value={rule.cache_ttl}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="3600 (seconds) or '24h'"
          />
        </div>
      )}

      {rule.action_type === 'redirect' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Link className="w-4 h-4 mr-1 text-red-600" />
              Destination URL
            </label>
            <input
              type="text"
              name="redirect_url"
              value={rule.redirect_url}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://new.example.com/landing"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Redirect Type
            </label>
            <select
              name="redirect_type"
              value={rule.redirect_type}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="301">301 (Permanent Redirect)</option>
              <option value="302">302 (Temporary Redirect)</option>
            </select>
          </div>
        </>
      )}

      {rule.action_type === 'security' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Lock className="w-4 h-4 mr-1 text-yellow-600" />
            Security Header to Apply
          </label>
          <select
            name="security_header"
            value={rule.security_header}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="hsts">HSTS (Strict-Transport-Security)</option>
            <option value="cors">CORS Access-Control-Allow-Origin</option>
          </select>
        </div>
      )}

      {rule.action_type === 'rewrite' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Code className="w-4 h-4 mr-1 text-purple-600" />
              Capture Header Name (Path Component)
            </label>
            <input
              type="text"
              name="capture_header"
              value={rule.capture_header}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              placeholder="X-Captured-Path"
            />
            <p className="text-xs text-gray-500 mt-1">
              The wildcard content will be saved to this header.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Link className="w-4 h-4 mr-1 text-red-600" />
              New Destination Path (Use `req.http.X-Header` for capture)
            </label>
            <input
              type="text"
              name="rewrite_target"
              value={rule.rewrite_target}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="/v2/endpoint/"
            />
            <p className="text-xs text-gray-500 mt-1">
              **Example:** `/v2/endpoint/` + `req.http.X-Captured-Path`
            </p>
          </div>
        </>
      )}
    </div>
  );
};

const FastlyOutput = ({ rule }) => {
  const [copied, setCopied] = useState(false);
  
  // ✨ LLM Feature States
  const [vclExplanation, setVclExplanation] = useState('');
  const [isGeneratingVcl, setIsGeneratingVcl] = useState(false);
  const [bestPractices, setBestPractices] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Helper to convert Cloudflare URL pattern (*.com/path/*) to Fastly condition
  const getFastlyCondition = useCallback((pattern) => {
    // 1. Replace first wildcard with string start
    let condition = pattern.replace(/^\*\./, 'req.http.host ~ "');
    condition = condition.replace(/^\*/, 'req.url ~ "');

    // 2. Escape dots and replace wildcards with regex
    condition = condition.replace(/\./g, '\\.');
    condition = condition.replace(/\*/g, '.*');

    // 3. Close the regex string
    if (!condition.includes('req.http.host')) {
        condition = `req.url ~ "${condition}"`;
    } else {
        condition = condition + '"';
    }

    return condition.replace(/\.\*/g, '.*').replace(/\.\/\*/g, '.*');
  }, []);

  // Generic LLM API Call Wrapper
  const callGeminiApi = useCallback(async (userQuery, systemPrompt) => {
    const apiKey = "" 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    let response;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                return result.candidates?.[0]?.content?.parts?.[0]?.text;
            } else if (response.status === 429 && attempts < maxAttempts - 1) {
                const delay = Math.pow(2, attempts) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error(`API returned status ${response.status}`);
            }
        } catch (error) {
            console.error("Gemini API call failed:", error);
            throw new Error(`Failed to connect to AI service. ${error.message}`);
        } finally {
            attempts++;
        }
    }
    throw new Error('API call failed after multiple retries.');
  }, []);

  // ✨ VCL Explainer Feature
  const handleVclExplain = useCallback(async (vclContent) => {
    if (!vclContent) return;
    setVclExplanation('');
    setIsGeneratingVcl(true);
    setVclExplanation('Analyzing VCL with Gemini...');
    
    try {
        const systemPrompt = "You are an expert Fastly Varnish Configuration Language (VCL) developer. Your task is to analyze the provided VCL snippet, explain its purpose clearly and concisely, and point out any potential VCL lifecycle issues or common pitfalls, especially related to caching or request flow. Respond using markdown formatting.";
        const userQuery = `Analyze this VCL snippet:\n\n${vclContent}`;
        
        const text = await callGeminiApi(userQuery, systemPrompt);
        setVclExplanation(text || 'Error: Could not retrieve explanation.');
    } catch (error) {
        setVclExplanation(`Error: ${error.message}`);
    } finally {
        setIsGeneratingVcl(false);
    }
  }, [callGeminiApi]);

  // ✨ NEW Best Practice Suggester Feature
  const handleGetBestPractices = useCallback(async (actionType, urlPattern) => {
      if (!actionType) return;
      setBestPractices('');
      setIsSuggesting(true);
      setBestPractices('Getting best practices from Gemini...');
      
      let context = "";
      if (actionType === 'cache') {
          context = "common caching and TTL optimization practices, including Surrogate Keys or Stale-While-Revalidate.";
      } else if (actionType === 'redirect') {
          context = "best practices for edge redirects, considering VCL lifecycle and status codes.";
      } else if (actionType === 'security') {
          context = "recommended security practices for headers and TLS configuration.";
      } else if (actionType === 'rewrite') {
          context = "complex URL manipulation and path capture best practices.";
      } else {
          context = "general Fastly configuration tips.";
      }

      try {
          const systemPrompt = "You are a senior Fastly Architect. Provide 3 highly relevant, concise best practices related to the user's configuration action. Format the response as a simple markdown bulleted list.";
          const userQuery = `The user is implementing a Fastly rule for: ${actionType} at URL pattern: ${urlPattern}. What are 3 best practices or advanced tips related to ${context}?`;
          
          const text = await callGeminiApi(userQuery, systemPrompt);
          setBestPractices(text || 'Error: Could not retrieve suggestions.');
      } catch (error) {
          setBestPractices(`Error: ${error.message}`);
      } finally {
          setIsSuggesting(false);
      }
  }, [callGeminiApi]);


  const output = useMemo(() => {
    const { url_pattern, action_type, cache_ttl, redirect_url, redirect_type, security_header, rewrite_target, capture_header } = rule;
    const condition = getFastlyCondition(url_pattern);
    const service_id = "YOUR_SERVICE_ID";
    const version_num = "VERSION_NUMBER";

    if (!url_pattern || url_pattern === '') {
        return {
            title: "Waiting for Input",
            cli: "// Enter a Cloudflare URL pattern above to see the Fastly conversion.",
            vcl: ""
        };
    }

    if (action_type === 'cache') {
      const ttl = isNaN(parseInt(cache_ttl)) ? '3600s' : `${parseInt(cache_ttl)}s`;
      return {
        title: "Caching/TTL Override",
        description: "Fastly equivalent uses a Cache Setting applied via a Request Condition.",
        cli: `# 1. Define the Condition (Rule: ${url_pattern})
fastly condition create --service-id ${service_id} --version ${version_num} \\
    --name "CF_Cache_Override" --type "REQUEST" \\
    --statement "${condition}"

# 2. Define the Cache Setting
fastly cache-setting create --service-id ${service_id} --version ${version_num} \\
    --name "CF_Cache_TTL" --action "deliver" \\
    --ttl ${ttl} --stale-ttl ${ttl} --condition "CF_Cache_Override"
        `,
        vcl: `# VCL Snippet: vcl_recv (Apply this in the VCL Snippets tab)
# Note: You must apply the condition in vcl_recv.
if (${condition}) {
    # Set the TTL for this request specifically.
    # Fastly uses 'beresp.ttl' in vcl_fetch for origin-side control.
    # To override immediately, you typically adjust caching headers in vcl_recv
    # or use the UI Cache Setting (preferred). This simulates VCL for demonstration.
    set req.max_age = ${ttl};
    return(lookup);
}
        `
      };
    } else if (action_type === 'redirect') {
      const status_code = redirect_type.replace('3', '3'); // '301' or '302'
      const status_text = redirect_type === '301' ? 'Moved Permanently' : 'Found';
      return {
        title: "Forwarding URL (Redirect)",
        description: "Fastly equivalent uses a Response Object and a Request Condition.",
        cli: `# 1. Define the Condition (Rule: ${url_pattern})
fastly condition create --service-id ${service_id} --version ${version_num} \\
    --name "CF_Redirect_Condition" --type "REQUEST" \\
    --statement "${condition}"

# 2. Define the Response Object (The Redirect Action)
fastly response-object create --service-id ${service_id} --version ${version_num} \\
    --name "CF_Redirect_Action" --status ${status_code} --response "${status_text}" \\
    --content-type "text/html" \\
    --header "Location: ${redirect_url}" --condition "CF_Redirect_Condition"
        `,
        vcl: `# VCL Snippet: vcl_recv (Apply this in the VCL Snippets tab)
# This VCL snippet performs an immediate redirect at the edge.
if (${condition}) {
    error ${status_code} "${status_text}";
}

# VCL Snippet: vcl_error (Apply this in the VCL Snippets tab)
# Handle the custom error code and set the Location header.
if (obj.status == ${status_code}) {
    set obj.status = ${status_code};
    set obj.response = "${status_text}";
    set obj.http.Location = "${redirect_url}";
    synthetic(req.url); # Generate a minimal response body
    return(deliver);
}
        `
      };
    } else if (action_type === 'security') {
      const header_config = security_header === 'hsts' ?
        { name: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" } :
        { name: "Access-Control-Allow-Origin", value: "*" };

      return {
        title: `Security Header: ${header_config.name}`,
        description: "Fastly equivalent uses a Response Header object with a Request Condition (or applied globally).",
        cli: `# 1. Define the Condition (Rule: ${url_pattern})
fastly condition create --service-id ${service_id} --version ${version_num} \\
    --name "CF_${security_header.toUpperCase()}_Condition" --type "REQUEST" \\
    --statement "${condition}"

# 2. Define the Header Action
fastly header create --service-id ${service_id} --version ${version_num} \\
    --name "CF_${security_header.toUpperCase()}_Header" --type "response" \\
    --action "set" --dst "${header_config.name}" --src "${header_config.value}" \\
    --condition "CF_${security_header.toUpperCase()}_Condition"
        `,
        vcl: `# VCL Snippet: vcl_deliver (Apply this in the VCL Snippets tab)
# This VCL snippet modifies the response before it is sent to the client.
if (${condition}) {
    set resp.http.${header_config.name} = "${header_config.value}";
}
        `
      };
    } else if (action_type === 'rewrite') {
        const pathSegments = url_pattern.split('/');
        // Find the index of the path component that follows the host and is the first non-wildcard
        let captureBaseIndex = 0;
        let basePattern = '';
        for (let i = 3; i < pathSegments.length; i++) { // Start searching after http://host/
            if (pathSegments[i].includes('*')) {
                captureBaseIndex = i;
                break;
            }
            basePattern += `/${pathSegments[i]}`;
        }
        // Base pattern for regsub: e.g., if input is *example.com/api/*, basePattern is /api
        const finalBasePattern = basePattern.replace(/^\//, '').replace(/\//g, '\\/'); // 'api' -> 'api' or 'api/v1' -> 'api\\/v1'

        // Regex: Matches the path starting after the domain, capturing everything after the base path.
        // e.g., if basePattern is /api, regex is ^/api/(.*)
        const vclRegex = `^${basePattern.replace(/\//g, '\\/')}/(.*)$`;

        // The rewrite target uses string concatenation in VCL
        const vclRewrite = `set req.url = "${rewrite_target}" + req.http.${capture_header};`;


        return {
            title: "URL Path Rewrite & Capture",
            description: "Uses VCL's 'regsub' to extract the wildcard content into a header, then rewrites the URL.",
            cli: `# WARNING: This complex logic must be handled with VCL Snippets or Compute@Edge.
# The CLI defines the condition. The core capture/rewrite logic is VCL.
fastly condition create --service-id ${service_id} --version ${version_num} \\
    --name "CF_Rewrite_Condition" --type "REQUEST" \\
    --statement "${condition}"
            `,
            vcl: `// VCL Snippet: vcl_recv (Apply this in the VCL Snippets tab)
// This code captures the content of the wildcard (*) in the path, saves it to a header,
// and then rewrites the request URL before sending to the origin.
if (${condition}) {
    // 1. Capture the content matching the wildcard into the custom header: ${capture_header}
    // The pattern ${vclRegex} captures everything after the fixed path component into group 1.
    set req.http.${capture_header} = regsub(req.url, "${vclRegex}", "\\1");
    
    // 2. Rewrite the URL path, using string concatenation to append the captured value.
    // Ensure the rewrite_target is URL-encoded if necessary.
    ${vclRewrite}
    
    // Log the change for debugging (optional)
    synthetic("Captured: " req.http.${capture_header} " Rewritten to: " req.url);
    
    // Resume processing request with the new URL
    return(restart);
}
`
        };
    }

    return { title: "Ready", cli: "// Select an action to generate configuration.", vcl: "" };
  }, [rule, getFastlyCondition]);

  const handleCopy = (content) => {
    if (copyToClipboard(content)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg border-2 border-indigo-500/50 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center">
        <ChevronsRight className="w-5 h-5 mr-2 text-indigo-700" />
        Fastly Equivalent Configuration
      </h2>
      <p className="text-sm text-gray-600 italic">{output.description}</p>

      {/* CLI Output */}
      <div className="bg-gray-800 p-4 rounded-lg relative">
        <h3 className="text-sm font-medium text-white mb-2 flex items-center">
          <Code className="w-4 h-4 mr-1 text-pink-400" />
          Fastly CLI / API (Recommended)
        </h3>
        <button
          onClick={() => handleCopy(output.cli)}
          className={`absolute top-4 right-4 text-xs font-semibold py-1 px-3 rounded transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
        >
          <Copy className="inline w-3 h-3 mr-1" />
          {copied ? 'Copied!' : 'Copy CLI'}
        </button>
        <pre className="text-xs text-gray-200 overflow-x-auto whitespace-pre-wrap font-mono">
          {output.cli}
        </pre>
      </div>

      {/* VCL Output */}
      {output.vcl && (
        <div className="bg-gray-800 p-4 rounded-lg relative">
          <h3 className="text-sm font-medium text-white mb-2 flex items-center">
            <Code className="w-4 h-4 mr-1 text-cyan-400" />
            Raw VCL Snippet (Advanced)
          </h3>
          <pre className="text-xs text-gray-200 overflow-x-auto whitespace-pre-wrap font-mono">
            {output.vcl}
          </pre>
        </div>
      )}

      <div className="mt-4 p-3 text-xs text-indigo-700 bg-indigo-100 rounded-lg flex items-center">
        <RefreshCcw className="w-4 h-4 mr-2 flex-shrink-0" />
        Remember to replace `YOUR_SERVICE_ID` and `VERSION_NUMBER` with your actual Fastly details.
      </div>

      {/* --- GEMINI LLM Features Container (New) --- */}
      <div className="mt-6 border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* ✨ VCL Explainer Feature (Existing) */}
        {output.vcl && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
            <h3 className="text-lg font-bold text-indigo-800 flex items-center">
              ✨ VCL Explainer
            </h3>
            
            <button
                onClick={() => handleVclExplain(output.vcl)}
                disabled={isGeneratingVcl || !output.vcl}
                className="w-full py-2 px-4 text-white font-semibold rounded-lg shadow-md transition-all duration-200 text-sm
                          disabled:bg-gray-400 disabled:shadow-none bg-indigo-600 hover:bg-indigo-700"
            >
                {isGeneratingVcl ? (
                    'Analyzing VCL...'
                ) : (
                    `✨ Explain This VCL Code`
                )}
            </button>
            
            {vclExplanation && (
                <div className="bg-white p-3 rounded-lg border border-gray-300">
                    <h4 className="font-semibold text-gray-800 mb-2">Analysis:</h4>
                    <div className="text-xs text-gray-700 whitespace-pre-wrap">
                        {vclExplanation}
                    </div>
                </div>
            )}
          </div>
        )}

        {/* ✨ Best Practice Suggester (NEW) */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
            <h3 className="text-lg font-bold text-green-800 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              ✨ Best Practice Suggestions
            </h3>
            
            <button
                onClick={() => handleGetBestPractices(rule.action_type, rule.url_pattern)}
                disabled={isSuggesting || !rule.action_type}
                className="w-full py-2 px-4 text-white font-semibold rounded-lg shadow-md transition-all duration-200 text-sm
                          disabled:bg-gray-400 disabled:shadow-none bg-green-600 hover:bg-green-700"
            >
                {isSuggesting ? (
                    'Generating Tips...'
                ) : (
                    `✨ Get Fastly Best Practices`
                )}
            </button>
            
            {bestPractices && (
                <div className="bg-white p-3 rounded-lg border border-gray-300">
                    <h4 className="font-semibold text-gray-800 mb-2">Recommendations:</h4>
                    <div className="text-xs text-gray-700 whitespace-pre-wrap">
                        {bestPractices}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};


const App = () => {
  const [rule, setRule] = useState({
    url_pattern: 'https://www.example.com/api/v1/*',
    action_type: 'rewrite',
    cache_ttl: '86400', // 24 hours
    redirect_url: 'https://newsite.com/',
    redirect_type: '301',
    security_header: 'hsts',
    // New fields for rewrite
    rewrite_target: '/v2/legacy-api/',
    capture_header: 'X-Captured-Path',
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden">
        <Header />
        <main className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CloudflareRuleInput rule={rule} setRule={setRule} />
          <FastlyOutput rule={rule} />
        </main>
      </div>
    </div>
  );
};

export default App;

